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

    // Get object from R2
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    const response = await r2Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const buffer = Buffer.concat(chunks)

    // Determine content type
    let contentType = response.ContentType || 'application/octet-stream'
    
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

    // Set caching headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
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