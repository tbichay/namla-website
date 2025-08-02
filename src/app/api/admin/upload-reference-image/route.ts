import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2, getFilePath, generateUniqueFilename } from '@/lib/r2-client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Generate unique filename
    const originalName = file.name
    const uniqueFilename = generateUniqueFilename(originalName)
    
    // Create file path in R2 (store in reference-images folder)
    const filePath = getFilePath('reference-images', uniqueFilename)
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to R2
    const publicUrl = await uploadToR2(buffer, filePath, file.type)
    
    console.log('✅ Reference image uploaded:', {
      filename: uniqueFilename,
      size: file.size,
      url: publicUrl
    })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      originalName: originalName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('❌ Reference image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload reference image' },
      { status: 500 }
    )
  }
}