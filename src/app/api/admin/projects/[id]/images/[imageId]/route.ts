import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { ProjectImages } from '@/lib/services/projects'

interface RouteContext {
  params: { id: string; imageId: string }
}

// PUT /api/admin/projects/[id]/images/[imageId] - Update image metadata
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alt, caption, isMainImage, sortOrder } = body

    const updatedImage = await ProjectImages.updateProjectImage(params.imageId, {
      alt,
      caption,
      isMainImage,
      sortOrder
    })

    if (!updatedImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({ image: updatedImage })

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/projects/[id]/images/[imageId] - Delete image
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await ProjectImages.deleteProjectImage(params.imageId)

    if (!success) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Image deleted successfully' })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}