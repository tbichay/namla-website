import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
// import { r2Client } from '@/lib/r2-client'
// import { VideoProcessingService } from '@/lib/services/video-processing' // Disabled for Vercel compatibility
// import { randomUUID } from 'crypto'

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
      { error: 'Video compression temporarily disabled' }, 
      { status: 501 }
    )

  } catch (error) {
    console.error('💥 Video compression failed:', error)
    return NextResponse.json(
      { error: 'Video compression failed' }, 
      { status: 500 }
    )
  }
}

// Get compression status and available versions
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
      { error: 'Video compression status temporarily disabled' }, 
      { status: 501 }
    )

  } catch (error) {
    console.error('Error getting compression status:', error)
    return NextResponse.json(
      { error: 'Failed to get compression status' }, 
      { status: 500 }
    )
  }
}