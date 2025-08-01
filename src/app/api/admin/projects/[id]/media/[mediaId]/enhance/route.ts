import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'
import { AIEnhancementService } from '@/lib/services/ai-enhancement'

// Enhance a specific media item with AI
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
        { error: 'Video enhancement not supported' }, 
        { status: 400 }
      )
    }

    const { preset, provider, operations } = await request.json()

    // Get enhancement options
    let enhancementOptions
    if (preset) {
      const presets = AIEnhancementService.getPresets()
      enhancementOptions = presets[preset]
      if (!enhancementOptions) {
        return NextResponse.json(
          { error: `Unknown preset: ${preset}` },
          { status: 400 }
        )
      }
    } else {
      enhancementOptions = {
        provider: provider || 'autoenhance',
        operations: operations || {},
        quality: 'standard',
        output_format: 'webp'
      }
    }

    // Enhance the image
    const enhancementResult = await AIEnhancementService.enhanceImage(
      targetMedia.url,
      enhancementOptions
    )

    if (!enhancementResult.success) {
      return NextResponse.json(
        { error: enhancementResult.error || 'Enhancement failed' },
        { status: 500 }
      )
    }

    // In a real implementation, you would:
    // 1. Upload the enhanced image to R2
    // 2. Update the database record with the new URL
    // 3. Optionally keep the original as backup
    
    // For now, we'll return the enhancement result
    return NextResponse.json({
      message: 'Image enhanced successfully',
      enhancement: {
        original_url: enhancementResult.original_url,
        enhanced_url: enhancementResult.enhanced_url,
        operations_applied: enhancementResult.operations_applied,
        processing_time: enhancementResult.processing_time,
        cost: enhancementResult.cost,
        provider: enhancementResult.provider
      }
    })
  } catch (error) {
    console.error('Error enhancing media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available enhancement presets and cost estimates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, mediaId } = await params
    
    // Check if project and media exist
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const media = await ProjectImageService.getProjectImages(id)
    const targetMedia = media.find(m => m.id === mediaId)
    
    if (!targetMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Get available presets
    const presets = AIEnhancementService.getPresets()
    
    // Calculate cost estimates for each preset
    const presetsWithCosts = Object.entries(presets).map(([name, options]) => {
      const costEstimate = AIEnhancementService.estimateCost(1, options)
      return {
        name,
        displayName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: getPresetDescription(name),
        provider: options.provider,
        operations: options.operations,
        estimatedCost: costEstimate.costPerImage,
        processingTime: getEstimatedProcessingTime(options)
      }
    })

    return NextResponse.json({
      presets: presetsWithCosts,
      mediaInfo: {
        id: targetMedia.id,
        url: targetMedia.url,
        mediaType: getMediaTypeFromFilename(targetMedia.filename),
        filename: targetMedia.filename
      }
    })
  } catch (error) {
    console.error('Error fetching enhancement options:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPresetDescription(presetName: string): string {
  const descriptions: Record<string, string> = {
    'ai_professional': 'Professional AI enhancement using OpenAI with sky replacement, lighting optimization, and comprehensive real estate improvements.',
    'ai_quick_enhance': 'Fast AI enhancement using OpenAI focusing on lighting, quality, and noise reduction for quick results.',
    'real_estate_standard': 'AI-powered basic lighting correction, noise reduction, and quality enhancement using OpenAI for property photos.',
    'real_estate_premium': 'AI-powered complete real estate enhancement using OpenAI including sky replacement, HDR processing, and professional color grading.',
    'high_resolution': 'AI-powered image enhancement using OpenAI with advanced detail enhancement and sharpening.',
    'quick_fix': 'Fast AI enhancement using OpenAI focusing on lighting and basic quality improvements for quick turnaround.'
  }
  return descriptions[presetName] || 'Custom enhancement preset'
}

function getEstimatedProcessingTime(options: any): string {
  if (options.provider === 'openai') return '20-45 seconds'
  if (options.operations?.upscale) return '30-60 seconds'
  if (options.operations?.sky_replacement || options.operations?.hdr_merge) return '15-30 seconds'
  return '5-15 seconds'
}