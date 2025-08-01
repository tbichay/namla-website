import { NextRequest, NextResponse } from 'next/server'
import { ProjectService, ProjectImageService, getMediaTypeFromFilename } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Try to get project by slug first, then by ID if slug lookup fails
    let project = await ProjectService.getProjectBySlug(slug)
    
    // If not found by slug, try by ID (in case URL uses ID instead of slug)
    if (!project) {
      project = await ProjectService.getProjectById(slug)
    }
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Only return published projects for public API
    if (!project.isPublished) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get project images
    const images = await ProjectImageService.getProjectImages(project.id)
    
    // Format the response to match the expected structure
    const response = {
      ...project,
      media: images.map(img => {
        const mediaType = getMediaTypeFromFilename(img.filename)
        return {
          id: img.id,
          url: convertToInternalMediaUrl(img.url),
          type: mediaType,
          alt: img.alt || `${project.name} - ${mediaType === 'video' ? 'Video' : 'Bild'}`,
          caption: img.caption,
          isMainImage: img.isMainImage,
          sortOrder: img.sortOrder
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching project details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}