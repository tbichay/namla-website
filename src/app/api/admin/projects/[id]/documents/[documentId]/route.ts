import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectDocumentService } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

interface RouteContext {
  params: Promise<{ id: string; documentId: string }>
}

// Update document metadata
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await params
    const body = await request.json()
    
    // Validate the document exists
    const existingDocument = await ProjectDocumentService.getProjectDocumentById(documentId)
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update document metadata
    const updatedDocument = await ProjectDocumentService.updateProjectDocument(documentId, {
      displayName: body.displayName,
      description: body.description,
      isDownloadable: body.isDownloadable,
      sortOrder: body.sortOrder
    })
    
    if (!updatedDocument) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    const formattedDocument = {
      id: updatedDocument.id,
      url: convertToInternalMediaUrl(updatedDocument.url),
      filename: updatedDocument.filename,
      originalName: updatedDocument.originalName,
      displayName: updatedDocument.displayName,
      description: updatedDocument.description,
      fileType: updatedDocument.fileType,
      fileSize: parseInt(updatedDocument.fileSize),
      isDownloadable: updatedDocument.isDownloadable,
      sortOrder: updatedDocument.sortOrder,
      createdAt: updatedDocument.createdAt
    }

    return NextResponse.json({ 
      message: 'Document updated successfully',
      document: formattedDocument
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete document
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await params
    
    // Delete the document
    const success = await ProjectDocumentService.deleteProjectDocument(documentId)
    
    if (!success) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}