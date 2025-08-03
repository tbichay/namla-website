import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectDocumentService, getFileTypeFromExtension } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

// Upload documents to a project
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

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string
    const isDownloadable = formData.get('isDownloadable') === 'true'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      if (!file.size) continue

      // Validate file type
      const fileExtension = file.name.toLowerCase().split('.').pop() || ''
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
      
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileExtension}. Allowed types: ${allowedExtensions.join(', ')}` },
          { status: 400 }
        )
      }

      // File size limit: 50MB
      const maxFileSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File too large. Max size: 50MB` },
          { status: 400 }
        )
      }

      try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Upload the file
        const uploadedDocument = await ProjectDocumentService.uploadProjectDocument(
          id,
          buffer,
          file.name,
          {
            displayName: displayName || file.name,
            description: description || undefined,
            isDownloadable: isDownloadable !== false, // Default to true
            contentType: file.type
          }
        )

        uploadResults.push({
          id: uploadedDocument.id,
          url: convertToInternalMediaUrl(uploadedDocument.url),
          filename: uploadedDocument.filename,
          originalName: uploadedDocument.originalName,
          displayName: uploadedDocument.displayName,
          description: uploadedDocument.description,
          fileType: uploadedDocument.fileType,
          fileSize: parseInt(uploadedDocument.fileSize),
          isDownloadable: uploadedDocument.isDownloadable,
          sortOrder: uploadedDocument.sortOrder,
          createdAt: uploadedDocument.createdAt
        })
      } catch (uploadError) {
        console.error('Error uploading document:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      message: 'Documents uploaded successfully',
      documents: uploadResults
    })
  } catch (error) {
    console.error('Error uploading documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all documents for a project
export async function GET(
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

    // Get project documents
    const documents = await ProjectDocumentService.getProjectDocuments(id)
    
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      url: convertToInternalMediaUrl(doc.url),
      filename: doc.filename,
      originalName: doc.originalName,
      displayName: doc.displayName,
      description: doc.description,
      fileType: doc.fileType,
      fileSize: parseInt(doc.fileSize),
      isDownloadable: doc.isDownloadable,
      sortOrder: doc.sortOrder,
      createdAt: doc.createdAt
    }))

    return NextResponse.json({ documents: formattedDocuments })
  } catch (error) {
    console.error('Error fetching project documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}