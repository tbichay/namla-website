import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'
import { AIEnhancementService } from '@/lib/services/ai-enhancement'

// Advanced enhancement with HDR, sky replacement, and virtual staging
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

    // Only enhance images, not videos
    const mediaType = getMediaTypeFromFilename(targetMedia.filename)
    if (mediaType === 'video') {
      return NextResponse.json(
        { error: 'Advanced enhancement not supported for videos' }, 
        { status: 400 }
      )
    }

    const { 
      enhancementType, 
      hdrOptions, 
      skyOptions, 
      stagingOptions 
    } = await request.json()

    console.log(`🚀 Advanced enhancement request: ${enhancementType} for media ${mediaId}`)

    let enhancementResult

    switch (enhancementType) {
      case 'hdr':
        enhancementResult = await AIEnhancementService.processHDR(targetMedia.url, hdrOptions || {})
        break
        
      case 'sky_replacement':
        enhancementResult = await AIEnhancementService.replaceSky(targetMedia.url, skyOptions || {})
        break
        
      case 'virtual_staging':
        enhancementResult = await AIEnhancementService.virtualStaging(targetMedia.url, stagingOptions || {})
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid enhancement type. Use: hdr, sky_replacement, virtual_staging' },
          { status: 400 }
        )
    }

    if (!enhancementResult.success) {
      return NextResponse.json(
        { error: enhancementResult.error || 'Advanced enhancement failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Advanced ${enhancementType} enhancement completed successfully`,
      enhancement: {
        type: enhancementType,
        original_url: enhancementResult.original_url,
        enhanced_url: enhancementResult.enhanced_url,
        operations_applied: enhancementResult.operations_applied,
        processing_time: enhancementResult.processing_time,
        provider: enhancementResult.provider
      },
      mediaInfo: {
        id: targetMedia.id,
        filename: targetMedia.filename,
        originalName: targetMedia.originalName
      },
      options: {
        hdr: hdrOptions,
        sky: skyOptions,
        staging: stagingOptions
      }
    })

  } catch (error) {
    console.error('Advanced enhancement error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process advanced enhancement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}