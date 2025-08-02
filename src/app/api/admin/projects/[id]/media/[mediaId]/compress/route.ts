import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from '@/lib/r2-client'
import { VideoProcessingService } from '@/lib/services/video-processing'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, mediaId } = await params
    const { quality = 'medium', generateThumbnail = true } = await request.json()

    // Validate quality parameter
    if (!['low', 'medium', 'high'].includes(quality)) {
      return NextResponse.json({ error: 'Invalid quality parameter' }, { status: 400 })
    }

    // Get the original video file from R2
    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `projects/${projectId}/${mediaId}`,
    })

    let videoResponse
    try {
      videoResponse = await r2Client.send(getCommand)
    } catch (error) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 })
    }

    if (!videoResponse.Body) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 })
    }

    // Check if it's actually a video file
    const contentType = videoResponse.ContentType || ''
    if (!VideoProcessingService.isVideoFile(contentType)) {
      return NextResponse.json({ error: 'File is not a video' }, { status: 400 })
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = videoResponse.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const originalVideoBuffer = Buffer.concat(chunks)
    const originalSize = originalVideoBuffer.length

    // Get optimal settings based on file size
    const settings = VideoProcessingService.getOptimalSettings(originalSize)
    const targetQuality = quality as 'low' | 'medium' | 'high'

    console.log(`🎬 Starting video compression: ${quality} quality for ${(originalSize / 1024 / 1024).toFixed(2)}MB file`)

    // Compress video
    const compressedVideoBuffer = await VideoProcessingService.compressForWeb(
      originalVideoBuffer, 
      targetQuality
    )

    const compressedSize = compressedVideoBuffer.length
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

    console.log(`✅ Compression complete: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`)

    // Generate thumbnail if requested
    let thumbnailBuffer: Buffer | null = null
    if (generateThumbnail) {
      try {
        thumbnailBuffer = await VideoProcessingService.extractThumbnail(originalVideoBuffer, {
          thumbnailTime: 1,
          thumbnailWidth: settings.thumbnailWidth,
          thumbnailHeight: settings.thumbnailHeight,
          quality: 85
        })
        console.log(`📸 Generated thumbnail: ${(thumbnailBuffer.length / 1024).toFixed(2)}KB`)
      } catch (error) {
        console.warn('⚠️ Thumbnail generation failed:', error)
      }
    }

    // Upload compressed video
    const compressedKey = `projects/${projectId}/${mediaId}-compressed-${quality}`
    const putCompressedCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: compressedKey,
      Body: compressedVideoBuffer,
      ContentType: contentType,
      Metadata: {
        originalSize: originalSize.toString(),
        compressedSize: compressedSize.toString(),
        compressionRatio: compressionRatio.toString(),
        quality: targetQuality,
        processedAt: new Date().toISOString()
      }
    })

    await r2Client.send(putCompressedCommand)

    // Upload thumbnail if generated
    let thumbnailKey: string | null = null
    if (thumbnailBuffer) {
      thumbnailKey = `projects/${projectId}/${mediaId}-thumbnail.jpg`
      const putThumbnailCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          generatedFrom: mediaId,
          generatedAt: new Date().toISOString()
        }
      })

      await r2Client.send(putThumbnailCommand)
    }

    // Get video metadata
    let metadata
    try {
      metadata = await VideoProcessingService.getMetadata(originalVideoBuffer)
    } catch (error) {
      console.warn('⚠️ Metadata extraction failed:', error)
      metadata = null
    }

    return NextResponse.json({
      success: true,
      compression: {
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio),
        quality: targetQuality
      },
      files: {
        compressed: compressedKey,
        thumbnail: thumbnailKey,
        original: `projects/${projectId}/${mediaId}`
      },
      metadata,
      urls: {
        compressed: `/api/media/${compressedKey}`,
        thumbnail: thumbnailKey ? `/api/media/${thumbnailKey}` : null,
        original: `/api/media/projects/${projectId}/${mediaId}`
      }
    })

  } catch (error) {
    console.error('💥 Video compression failed:', error)
    return NextResponse.json(
      { error: 'Video compression failed' }, 
      { status: 500 }
    )
  }
}

// Get compression status and available versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, mediaId } = await params

    // Check for available compressed versions
    const versions = []
    const qualities = ['low', 'medium', 'high']

    for (const quality of qualities) {
      const key = `projects/${projectId}/${mediaId}-compressed-${quality}`
      try {
        const headCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
        
        const response = await r2Client.send(headCommand)
        
        versions.push({
          quality,
          size: response.ContentLength || 0,
          url: `/api/media/${key}`,
          metadata: response.Metadata || {},
          lastModified: response.LastModified
        })
      } catch (error) {
        // Version doesn't exist, skip
      }
    }

    // Check for thumbnail
    let thumbnail = null
    const thumbnailKey = `projects/${projectId}/${mediaId}-thumbnail.jpg`
    try {
      const headCommand = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: thumbnailKey,
      })
      
      const response = await r2Client.send(headCommand)
      thumbnail = {
        url: `/api/media/${thumbnailKey}`,
        size: response.ContentLength || 0,
        lastModified: response.LastModified
      }
    } catch (error) {
      // Thumbnail doesn't exist
    }

    return NextResponse.json({
      versions,
      thumbnail,
      hasCompressedVersions: versions.length > 0
    })

  } catch (error) {
    console.error('Error getting compression status:', error)
    return NextResponse.json(
      { error: 'Failed to get compression status' }, 
      { status: 500 }
    )
  }
}