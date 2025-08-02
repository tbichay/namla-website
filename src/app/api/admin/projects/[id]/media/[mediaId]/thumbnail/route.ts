import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from '@/lib/r2-client'
import { VideoProcessingService } from '@/lib/services/video-processing'

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
    const { time = 1, width = 640, height = 360 } = await request.json()

    // Get the video file from R2
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

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = videoResponse.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const videoBuffer = Buffer.concat(chunks)

    // Check if it's actually a video file
    const contentType = videoResponse.ContentType || ''
    if (!VideoProcessingService.isVideoFile(contentType)) {
      return NextResponse.json({ error: 'File is not a video' }, { status: 400 })
    }

    // Generate thumbnail
    const thumbnailBuffer = await VideoProcessingService.extractThumbnail(videoBuffer, {
      thumbnailTime: time,
      thumbnailWidth: width,
      thumbnailHeight: height,
      quality: 85
    })

    // Return thumbnail as response
    return new NextResponse(thumbnailBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': thumbnailBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })

  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' }, 
      { status: 500 }
    )
  }
}

// Get video metadata
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

    // Get the video file from R2
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

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = videoResponse.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const videoBuffer = Buffer.concat(chunks)

    // Check if it's actually a video file
    const contentType = videoResponse.ContentType || ''
    if (!VideoProcessingService.isVideoFile(contentType)) {
      return NextResponse.json({ error: 'File is not a video' }, { status: 400 })
    }

    // Get video metadata
    const metadata = await VideoProcessingService.getMetadata(videoBuffer)

    return NextResponse.json({
      metadata,
      thumbnailUrl: `/api/admin/projects/${projectId}/media/${mediaId}/thumbnail`
    })

  } catch (error) {
    console.error('Error getting video metadata:', error)
    return NextResponse.json(
      { error: 'Failed to get video metadata' }, 
      { status: 500 }
    )
  }
}