import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'
import { ImageEditorService } from '@/lib/services/image-editor'

// Basic image editing - crop, resize, rotate
export async function POST(
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

    // Get the specific media item
    const media = await ProjectImageService.getProjectImages(id)
    const targetMedia = media.find(m => m.id === mediaId)
    
    if (!targetMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Only edit images, not videos
    const mediaType = getMediaTypeFromFilename(targetMedia.filename)
    if (mediaType === 'video') {
      return NextResponse.json(
        { error: 'Image editing not supported for videos' }, 
        { status: 400 }
      )
    }

    const { operation, options, multipleOperations } = await request.json()

    console.log(`✂️ Image editing request: ${operation || 'multiple'} for media ${mediaId}`)

    let editResult

    if (multipleOperations && Array.isArray(multipleOperations)) {
      // Handle multiple operations in sequence
      editResult = await ImageEditorService.performMultipleEdits(
        targetMedia.url, 
        multipleOperations,
        id // Pass project ID for proper storage path
      )
    } else {
      // Handle single operation
      switch (operation) {
        case 'crop':
          editResult = await ImageEditorService.cropImage(targetMedia.url, options, id)
          break
          
        case 'resize':
          editResult = await ImageEditorService.resizeImage(targetMedia.url, options, id)
          break
          
        case 'rotate':
          editResult = await ImageEditorService.rotateImage(targetMedia.url, options, id)
          break
          
        case 'adjust':
          editResult = await ImageEditorService.adjustImage(targetMedia.url, options, id)
          break
          
        case 'metadata':
          const metadataResult = await ImageEditorService.getImageMetadata(targetMedia.url)
          return NextResponse.json({
            success: metadataResult.success,
            metadata: metadataResult.metadata,
            error: metadataResult.error
          })
          
        default:
          return NextResponse.json(
            { error: 'Invalid operation. Use: crop, resize, rotate, adjust, metadata' },
            { status: 400 }
          )
      }
    }

    if (!editResult.success) {
      return NextResponse.json(
        { error: editResult.error || 'Image editing failed' },
        { status: 500 }
      )
    }

    // Update database with edited image URL
    if (editResult.edited_url) {
      try {
        await ProjectImageService.updateProjectImageUrl(
          mediaId,
          editResult.edited_url,
          {
            operations: editResult.operations_applied,
            editedAt: new Date()
          }
        )
        console.log(`✅ Database updated with edited URL for media ${mediaId}:`, editResult.edited_url)
      } catch (dbError) {
        console.error('Failed to update database with edited URL:', dbError)
        // Continue anyway - the edit was successful, just the DB update failed
      }
    }

    return NextResponse.json({
      success: true,
      message: `Image ${operation || 'editing'} completed successfully`,
      result: {
        operation: operation || 'multiple_operations',
        original_url: editResult.original_url,
        edited_url: editResult.edited_url,
        operations_applied: editResult.operations_applied,
        metadata: editResult.metadata
      },
      mediaInfo: {
        id: targetMedia.id,
        filename: targetMedia.filename,
        originalName: targetMedia.originalName
      }
    })

  } catch (error) {
    console.error('Image editing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process image editing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}