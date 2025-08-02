import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService } from '@/lib/services/projects'
import { AIEnhancementService } from '@/lib/services/ai-enhancement'

// Get smart enhancement suggestions for a specific media item
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

    // Only analyze images, not videos
    if (!targetMedia.filename.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return NextResponse.json(
        { error: 'Smart suggestions only available for images' }, 
        { status: 400 }
      )
    }

    console.log(`🧠 Generating smart suggestions for media ${mediaId}...`)

    // Generate smart suggestions using AI analysis
    const suggestions = await AIEnhancementService.generateSmartSuggestions(targetMedia.url)

    return NextResponse.json({
      success: true,
      mediaId,
      imageUrl: targetMedia.url,
      suggestions: {
        primary: suggestions.primary,
        alternatives: suggestions.alternatives,
        reasons: suggestions.reasons,
        confidence: suggestions.confidence,
        issues: suggestions.issues
      },
      analysis: {
        timestamp: new Date().toISOString(),
        confidence: suggestions.confidence
      }
    })

  } catch (error) {
    console.error('Smart suggestions error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate smart suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}