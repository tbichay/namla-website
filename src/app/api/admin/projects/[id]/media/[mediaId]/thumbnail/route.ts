import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { GetObjectCommand } from '@aws-sdk/client-s3'
// import { r2Client } from '@/lib/r2-client'
// import { VideoProcessingService } from '@/lib/services/video-processing' // Disabled for Vercel compatibility

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Video processing temporarily disabled for Vercel compatibility
    return NextResponse.json(
      { error: 'Video thumbnail generation temporarily disabled' }, 
      { status: 501 }
    )

  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' }, 
      { status: 500 }
    )
  }
}

// Get video metadata
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Video processing temporarily disabled for Vercel compatibility
    return NextResponse.json(
      { error: 'Video metadata retrieval temporarily disabled' }, 
      { status: 501 }
    )

  } catch (error) {
    console.error('Error getting video metadata:', error)
    return NextResponse.json(
      { error: 'Failed to get video metadata' }, 
      { status: 500 }
    )
  }
}