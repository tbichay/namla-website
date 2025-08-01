import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

// Upload media to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const alt = formData.get('alt') as string
    const caption = formData.get('caption') as string
    const isMainImage = formData.get('isMainImage') === 'true'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      if (!file.size) continue

      // Validate file type
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 400 }
        )
      }

      // File size limits
      const maxImageSize = 10 * 1024 * 1024 // 10MB for images
      const maxVideoSize = 100 * 1024 * 1024 // 100MB for videos
      const maxSize = isVideo ? maxVideoSize : maxImageSize

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
          { status: 400 }
        )
      }

      try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Upload the file
        const uploadedImage = await ProjectImageService.uploadProjectImage(
          id,
          buffer,
          file.name,
          {
            alt: alt || undefined,
            caption: caption || undefined,
            isMainImage: isMainImage && uploadResults.length === 0, // Only first file can be main
            contentType: file.type
          }
        )

        uploadResults.push({
          id: uploadedImage.id,
          url: convertToInternalMediaUrl(uploadedImage.url),
          filename: uploadedImage.filename,
          originalName: uploadedImage.originalName,
          mediaType: getMediaTypeFromFilename(uploadedImage.filename),
          alt: uploadedImage.alt,
          caption: uploadedImage.caption,
          isMainImage: uploadedImage.isMainImage
        })
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      media: uploadResults
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all media for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get project media
    const media = await ProjectImageService.getProjectImages(id)
    
    const formattedMedia = media.map(item => ({
      id: item.id,
      url: convertToInternalMediaUrl(item.url),
      filename: item.filename,
      originalName: item.originalName,
      mediaType: getMediaTypeFromFilename(item.filename),
      alt: item.alt,
      caption: item.caption,
      isMainImage: item.isMainImage,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt
    }))

    return NextResponse.json({ media: formattedMedia })
  } catch (error) {
    console.error('Error fetching project media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}