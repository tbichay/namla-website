import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from '@/lib/r2-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const key = path.join('/')

    if (!key) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 })
    }

    // Get file metadata first to determine content length
    const headCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    let headResponse
    try {
      headResponse = await r2Client.send(headCommand)
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      throw error
    }

    const fileSize = headResponse.ContentLength || 0
    const rangeHeader = request.headers.get('range')

    // Determine content type
    let contentType = headResponse.ContentType || 'application/octet-stream'
    
    // Fallback content type detection based on file extension
    if (contentType === 'application/octet-stream') {
      const extension = key.toLowerCase().split('.').pop()
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'webp':
          contentType = 'image/webp'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'mp4':
          contentType = 'video/mp4'
          break
        case 'mov':
          contentType = 'video/quicktime'
          break
        case 'avi':
          contentType = 'video/x-msvideo'
          break
        case 'webm':
          contentType = 'video/webm'
          break
      }
    }

    // Determine if this is a video file for range request optimization
    const isVideo = contentType.startsWith('video/')

    // Handle range requests (mainly for video streaming)
    if (rangeHeader && isVideo) {
      const ranges = parseRangeHeader(rangeHeader, fileSize)
      
      if (!ranges || ranges.length === 0) {
        return new NextResponse(null, { 
          status: 416, 
          headers: { 'Content-Range': `bytes */${fileSize}` }
        })
      }

      // Support single range only (most common case)
      const { start, end } = ranges[0]
      const contentLength = end - start + 1

      // Get partial object from R2
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Range: `bytes=${start}-${end}`,
      })

      const response = await r2Client.send(command)
      
      if (!response.Body) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      // Stream the partial content
      const stream = response.Body.transformToWebStream()

      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': contentLength.toString(),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })

      // Add Content-Disposition for downloads if requested
      const downloadParam = request.nextUrl.searchParams.get('download')
      if (downloadParam === 'true') {
        const filename = key.split('/').pop() || 'download'
        headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      }

      return new NextResponse(stream, {
        status: 206, // Partial Content
        headers,
      })
    }

    // For non-range requests or non-video files, serve the entire file
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    const response = await r2Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // For videos, stream the content directly for better performance
    // For images, we can still buffer for caching
    if (isVideo) {
      const stream = response.Body.transformToWebStream()
      
      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })

      // Add Content-Disposition for downloads if requested
      const downloadParam = request.nextUrl.searchParams.get('download')
      if (downloadParam === 'true') {
        const filename = key.split('/').pop() || 'download'
        headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      }

      return new NextResponse(stream, {
        status: 200,
        headers,
      })
    }

    // For images, convert stream to buffer (existing behavior)
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const buffer = Buffer.concat(chunks)

    // Set caching headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': buffer.length.toString(),
    })

    // Add Content-Disposition for downloads if requested
    const downloadParam = request.nextUrl.searchParams.get('download')
    if (downloadParam === 'true') {
      const filename = key.split('/').pop() || 'download'
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    }

    return new NextResponse(buffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error serving media file:', error)
    
    // Check if it's a NoSuchKey error (file not found)
    if (error instanceof Error && error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}

// Helper function to parse Range header
function parseRangeHeader(rangeHeader: string, fileSize: number) {
  const ranges: Array<{ start: number; end: number }> = []
  
  // Remove 'bytes=' prefix
  const rangeSpec = rangeHeader.replace(/^bytes=/, '')
  
  // Split multiple ranges (though we'll only handle single range)
  const rangeParts = rangeSpec.split(',')
  
  for (const part of rangeParts) {
    const range = part.trim()
    const [startStr, endStr] = range.split('-')
    
    let start: number
    let end: number
    
    if (startStr === '') {
      // Suffix range: -500 (last 500 bytes)
      start = Math.max(0, fileSize - parseInt(endStr))
      end = fileSize - 1
    } else if (endStr === '') {
      // Prefix range: 500- (from byte 500 to end)
      start = parseInt(startStr)
      end = fileSize - 1
    } else {
      // Full range: 500-999
      start = parseInt(startStr)
      end = parseInt(endStr)
    }
    
    // Validate range
    if (start >= 0 && end >= start && start < fileSize) {
      end = Math.min(end, fileSize - 1)
      ranges.push({ start, end })
    }
  }
  
  return ranges
}