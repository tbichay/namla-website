import { NextRequest, NextResponse } from 'next/server'
import { ProjectService, ProjectDocumentService } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

interface RouteContext {
  params: Promise<{ slug: string }>
}

// Get downloadable documents for a public project
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    
    // Try to get project by slug first, then by ID if slug lookup fails
    let project = await ProjectService.getProjectBySlug(slug)
    
    // If not found by slug, try by ID (in case URL uses ID instead of slug)
    if (!project) {
      project = await ProjectService.getProjectById(slug)
    }
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only return documents for published projects
    if (!project.isPublished) {
      return NextResponse.json({ error: 'Project not published' }, { status: 404 })
    }

    // Get only downloadable documents
    const documents = await ProjectDocumentService.getDownloadableDocuments(project.id)
    
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      displayName: doc.displayName,
      description: doc.description,
      fileType: doc.fileType,
      fileSize: parseInt(doc.fileSize),
      // For public access, we provide a download URL instead of direct R2 URL
      downloadUrl: `/api/projects/${slug}/documents/${doc.id}/download`,
      createdAt: doc.createdAt
    }))

    return NextResponse.json({ 
      documents: formattedDocuments,
      total: formattedDocuments.length
    })
  } catch (error) {
    console.error('Error fetching public project documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}