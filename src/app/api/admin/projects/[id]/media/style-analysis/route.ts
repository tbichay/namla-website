import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, ProjectImageService } from '@/lib/services/projects'
import { AIEnhancementService } from '@/lib/services/ai-enhancement'

// Analyze styles and find similar images in a project
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
    const { targetImageUrl, mode } = await request.json()
    
    // Check if project exists
    const project = await ProjectService.getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!targetImageUrl) {
      return NextResponse.json({ error: 'Target image URL is required' }, { status: 400 })
    }

    console.log(`🎨 Style analysis request for project ${id}, mode: ${mode}`)

    if (mode === 'analyze') {
      // Analyze single image style
      const styleAnalysis = await AIEnhancementService.analyzeImageStyle(targetImageUrl)
      
      return NextResponse.json({
        success: true,
        targetImageUrl,
        analysis: styleAnalysis,
        timestamp: new Date().toISOString()
      })
      
    } else if (mode === 'find_similar') {
      // Find similar styles within the project
      const allImages = await ProjectImageService.getProjectImages(id)
      
      // Filter out the target image and only include other images
      const candidateImages = allImages
        .filter(img => img.url !== targetImageUrl)
        .map(img => ({
          id: img.id,
          url: img.url,
          originalUrl: img.originalUrl || undefined
        }))

      if (candidateImages.length === 0) {
        return NextResponse.json({
          success: true,
          targetImageUrl,
          similarImages: [],
          message: 'No other images in project to compare with'
        })
      }

      console.log(`🔍 Finding similar styles among ${candidateImages.length} candidate images...`)
      
      const similarImages = await AIEnhancementService.findSimilarStyles(
        targetImageUrl,
        candidateImages
      )

      return NextResponse.json({
        success: true,
        targetImageUrl,
        candidatesAnalyzed: candidateImages.length,
        similarImages: similarImages.map(match => ({
          id: match.id,
          url: match.url,
          similarity: Math.round(match.similarity * 100),
          matchingAttributes: match.matchingAttributes,
          recommendedForStyleTransfer: match.recommendedForStyleTransfer
        })),
        recommendations: {
          bestMatch: similarImages[0] || null,
          styleTransferCandidates: similarImages.filter(img => img.recommendedForStyleTransfer).slice(0, 3)
        }
      })
      
    } else {
      return NextResponse.json({ error: 'Invalid mode. Use "analyze" or "find_similar"' }, { status: 400 })
    }

  } catch (error) {
    console.error('Style analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform style analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}