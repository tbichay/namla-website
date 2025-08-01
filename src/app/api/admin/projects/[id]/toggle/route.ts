import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { Projects } from '@/lib/services/projects'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST /api/admin/projects/[id]/toggle - Toggle project publication status
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updatedProject = await Projects.togglePublication(id)
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      project: updatedProject,
      message: `Project ${updatedProject.isPublished ? 'published' : 'unpublished'} successfully`
    })

  } catch (error) {
    console.error('Error toggling project status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}