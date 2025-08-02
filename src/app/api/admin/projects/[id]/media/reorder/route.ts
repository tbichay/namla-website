import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService } from '@/lib/services/projects'

// Reorder media items within a project
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

    const { mediaId, newPosition } = await request.json()

    if (!mediaId || typeof newPosition !== 'number') {
      return NextResponse.json(
        { error: 'mediaId and newPosition are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Reordering media ${mediaId} to position ${newPosition} in project ${id}`)

    // Get all media for this project
    const allMedia = await ProjectImageService.getProjectImages(id)
    
    // Find the media item to move
    const mediaToMove = allMedia.find(item => item.id === mediaId)
    if (!mediaToMove) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Validate new position
    if (newPosition < 0 || newPosition >= allMedia.length) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      )
    }

    // Create new order array
    const mediaWithoutMoved = allMedia.filter(item => item.id !== mediaId)
    const newOrder = [
      ...mediaWithoutMoved.slice(0, newPosition),
      mediaToMove,
      ...mediaWithoutMoved.slice(newPosition)
    ]

    // Update sortOrder for all affected items using the existing reorderImages method
    const imageOrders = newOrder.map((item, index) => ({
      id: item.id,
      sortOrder: index
    }))

    await ProjectImageService.reorderImages(imageOrders)

    console.log(`✅ Successfully reordered media in project ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Media reordered successfully',
      newOrder: newOrder.map((item, index) => ({
        id: item.id,
        sortOrder: index
      }))
    })

  } catch (error) {
    console.error('Media reordering error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to reorder media',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}