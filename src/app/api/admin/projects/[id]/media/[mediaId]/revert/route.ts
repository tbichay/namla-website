import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectImageService } from '@/lib/services/projects'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, mediaId } = params

    console.log(`🔄 Reverting image ${mediaId} to original in project ${projectId}`)

    // Revert the image to original URL
    const revertedImage = await ProjectImageService.revertProjectImageToOriginal(mediaId)

    if (!revertedImage) {
      return NextResponse.json(
        { error: 'Image not found or no original version available' }, 
        { status: 404 }
      )
    }

    console.log(`✅ Image ${mediaId} reverted to original:`, revertedImage.url)

    return NextResponse.json({
      success: true,
      message: 'Image reverted to original successfully',
      image: {
        id: revertedImage.id,
        url: revertedImage.url,
        originalUrl: revertedImage.originalUrl
      }
    })

  } catch (error) {
    console.error('Revert to original failed:', error)
    return NextResponse.json(
      { error: 'Failed to revert image to original' },
      { status: 500 }
    )
  }
}