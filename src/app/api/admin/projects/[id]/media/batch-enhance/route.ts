import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIEnhancementService } from '@/lib/services/ai-enhancement'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { mediaIds, preset, style_transfer, reference_image_url } = body

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: 'Media IDs are required' }, { status: 400 })
    }

    if (!preset) {
      return NextResponse.json({ error: 'Preset is required' }, { status: 400 })
    }

    // Get all media items for the project that match the selected IDs
    const mediaItems = await db.projectImages.findMany({
      where: {
        id: { in: mediaIds },
        projectId: projectId
      }
    })

    if (mediaItems.length === 0) {
      return NextResponse.json({ error: 'No valid media items found' }, { status: 404 })
    }

    // Process each image with the same enhancement settings
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const mediaItem of mediaItems) {
      try {
        console.log(`🔄 Processing batch enhancement for media ${mediaItem.id}...`)
        
        const options = {
          operations: {
            style_transfer: style_transfer || false,
            lighting_correction: true,
            sharpness_enhancement: true
          },
          style_reference: reference_image_url,
          quality: 'high'
        }

        const enhancedResult = await AIEnhancementService.enhanceImage(
          mediaItem.url,
          options
        )

        if (enhancedResult?.enhanced_url) {
          // Update the database with the enhanced URL
          await db.projectImages.update({
            where: { id: mediaItem.id },
            data: { 
              url: enhancedResult.enhanced_url,
              originalUrl: mediaItem.url, // Keep track of original
            }
          })

          results.push({
            mediaId: mediaItem.id,
            success: true,
            enhanced_url: enhancedResult.enhanced_url,
            original_url: mediaItem.url
          })
          successCount++
          
          console.log(`✅ Successfully enhanced media ${mediaItem.id}`)
        } else {
          throw new Error('No enhanced URL returned')
        }
      } catch (error) {
        console.error(`❌ Failed to enhance media ${mediaItem.id}:`, error)
        results.push({
          mediaId: mediaItem.id,
          success: false,
          error: error instanceof Error ? error.message : 'Enhancement failed'
        })
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch enhancement completed: ${successCount} successful, ${failureCount} failed`,
      results,
      successCount,
      failureCount,
      totalProcessed: mediaItems.length
    })

  } catch (error) {
    console.error('Batch enhancement error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch enhancement' },
      { status: 500 }
    )
  }
}