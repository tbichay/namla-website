import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'

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