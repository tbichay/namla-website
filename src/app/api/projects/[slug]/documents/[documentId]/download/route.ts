import { NextRequest, NextResponse } from 'next/server'
import { ProjectService, ProjectDocumentService } from '@/lib/services/projects'

interface RouteContext {
  params: Promise<{ slug: string; documentId: string }>
}

// Download a document file
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug, documentId } = await params
    
    // Try to get project by slug first, then by ID if slug lookup fails
    let project = await ProjectService.getProjectBySlug(slug)
    
    // If not found by slug, try by ID (in case URL uses ID instead of slug)
    if (!project) {
      project = await ProjectService.getProjectById(slug)
    }
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only allow downloads for published projects
    if (!project.isPublished) {
      return NextResponse.json({ error: 'Project not published' }, { status: 404 })
    }

    // Get the document and verify it's downloadable
    const document = await ProjectDocumentService.getProjectDocumentById(documentId)
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify document belongs to the project
    if (document.projectId !== project.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify document is downloadable
    if (!document.isDownloadable) {
      return NextResponse.json({ error: 'Document not available for download' }, { status: 404 })
    }

    // Redirect to the actual R2 file URL
    // In production, you might want to use signed URLs for better security
    return NextResponse.redirect(document.url)
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}