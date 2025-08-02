import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'

// Get individual media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params
    
    // DEBUGGING: Log detailed request information
    console.log('🔍 API CALL - Media endpoint accessed:', {
      timestamp: new Date().toISOString(),
      projectId: id,
      mediaId: mediaId,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      accept: request.headers.get('accept'),
      'accept-language': request.headers.get('accept-language'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      allHeaders: Object.fromEntries(request.headers.entries())
    })

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('🔍 API CALL - Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const media = await ProjectImageService.getProjectImageById(mediaId)

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: media.id,
      url: media.url,
      originalUrl: media.originalUrl,
      filename: media.filename,
      originalName: media.originalName,
      mediaType: getMediaTypeFromFilename(media.filename),
      alt: media.alt,
      caption: media.caption,
      isMainImage: media.isMainImage,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt
    })
  } catch (error) {
    console.error('Error getting media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update media item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, mediaId } = await params
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { alt, caption, isMainImage, sortOrder } = await request.json()

    const updatedMedia = await ProjectImageService.updateProjectImage(mediaId, {
      alt,
      caption,
      isMainImage,
      sortOrder
    })

    if (!updatedMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Media updated successfully',
      media: {
        id: updatedMedia.id,
        url: updatedMedia.url,
        filename: updatedMedia.filename,
        originalName: updatedMedia.originalName,
        mediaType: getMediaTypeFromFilename(updatedMedia.filename),
        alt: updatedMedia.alt,
        caption: updatedMedia.caption,
        isMainImage: updatedMedia.isMainImage,
        sortOrder: updatedMedia.sortOrder
      }
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, mediaId } = await params
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const success = await ProjectImageService.deleteProjectImage(mediaId)

    if (!success) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Reorder media items
export async function PUT(
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

    const { mediaOrders } = await request.json()

    if (!Array.isArray(mediaOrders)) {
      return NextResponse.json({ error: 'Invalid media orders' }, { status: 400 })
    }

    await ProjectImageService.reorderImages(mediaOrders)

    return NextResponse.json({ message: 'Media reordered successfully' })
  } catch (error) {
    console.error('Error reordering media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}