import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { Projects } from '@/lib/services/projects'

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const status = searchParams.get('status')
    const orderBy = searchParams.get('orderBy') as 'created_at' | 'updated_at' | 'name' || 'updated_at'
    const order = searchParams.get('order') as 'asc' | 'desc' || 'desc'

    const options = {
      published: published ? published === 'true' : undefined,
      status: status || undefined,
      orderBy,
      order
    }

    const projects = await Projects.getAllProjects(options)

    return NextResponse.json({
      projects,
      total: projects.length
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { name, location, status, type } = body
    if (!name || !location || !status || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, location, status, type' 
      }, { status: 400 })
    }

    // Generate slug if not provided
    const slug = body.slug || await Projects.generateSlug(name)

    // Handle publishedAt - convert string to Date if needed
    let publishedAt = body.publishedAt
    if (publishedAt && typeof publishedAt === 'string') {
      publishedAt = new Date(publishedAt)
    } else if (body.isPublished && !publishedAt) {
      // If publishing but no publishedAt provided, set to now
      publishedAt = new Date()
    }

    // Create project
    const projectData = {
      ...body,
      slug,
      publishedAt,
      images: body.images || [],
      features: body.features || [],
      details: body.details || {},
      locationDetails: body.locationDetails || {}
    }

    const project = await Projects.createProject(projectData)

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}