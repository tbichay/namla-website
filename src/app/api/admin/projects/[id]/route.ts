import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { Projects } from '@/lib/services/projects'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/admin/projects/[id] - Get project by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const project = await Projects.getProjectById(id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/projects/[id] - Update project
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Check if project exists
    const existingProject = await Projects.getProjectById(id)
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate new slug if name changed
    if (body.name && body.name !== existingProject.name && !body.slug) {
      body.slug = await Projects.generateSlug(body.name)
    }

    // Handle publishedAt field
    if (body.isPublished !== undefined) {
      if (body.isPublished && !existingProject.isPublished) {
        // Publishing for the first time
        body.publishedAt = new Date()
      } else if (!body.isPublished) {
        // Unpublishing
        body.publishedAt = null
      }
      // If already published and staying published, keep existing publishedAt
    }

    const updatedProject = await Projects.updateProject(id, body)
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ project: updatedProject })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const success = await Projects.deleteProject(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })

  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}