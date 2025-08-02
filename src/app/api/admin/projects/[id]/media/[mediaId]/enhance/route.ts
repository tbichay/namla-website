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

    const { preset, provider, operations, style_transfer, reference_image_url } = await request.json()

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
      
      // Enable style transfer if requested
      if (style_transfer) {
        enhancementOptions = {
          ...enhancementOptions,
          operations: {
            ...enhancementOptions.operations,
            style_transfer: true
          },
          style_reference: reference_image_url
        }
      }
    } else {
      enhancementOptions = {
        provider: provider || 'replicate',
        operations: {
          ...operations,
          style_transfer: style_transfer || false
        },
        quality: 'standard',
        output_format: 'png',
        style_reference: reference_image_url
      }
    }

    console.log('🚀 Starting enhancement with options:', enhancementOptions)
    
    // Enhance the image
    const enhancementResult = await AIEnhancementService.enhanceImage(
      targetMedia.url,
      enhancementOptions
    )

    console.log('📊 Enhancement result:', enhancementResult)

    if (!enhancementResult.success) {
      console.error('❌ Enhancement failed:', enhancementResult.error)
      return NextResponse.json(
        { error: enhancementResult.error || 'Enhancement failed' },
        { status: 500 }
      )
    }

    // Return the enhancement result
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
    'quick_fix': 'Fast AI enhancement using OpenAI focusing on lighting and basic quality improvements for quick turnaround.',
    'ai_upscale': 'Real AI-powered image upscaling using Replicate models that preserve original content while improving resolution and quality.',
    'ai_enhance': 'Real AI-powered image enhancement using Replicate models focusing on sharpness, lighting, and quality improvements without changing content.',
    'style_transfer_luxury': 'Advanced AI style transfer that applies luxury real estate photography styling while preserving original composition and structure.',
    'real_estate_pro': 'Professional real estate enhancement using multi-model AI pipeline for optimal lighting, quality, and perspective correction.'
  }
  return descriptions[presetName] || 'Custom enhancement preset'
}

function getEstimatedProcessingTime(options: any): string {
  if (options.provider === 'openai') return '20-45 seconds'
  if (options.operations?.upscale) return '30-60 seconds'
  if (options.operations?.sky_replacement || options.operations?.hdr_merge) return '15-30 seconds'
  return '5-15 seconds'
}