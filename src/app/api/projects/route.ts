import { NextRequest, NextResponse } from 'next/server'
import { Projects, ProjectImages, getMediaTypeFromFilename } from '@/lib/services/projects'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

// GET /api/projects - Public endpoint for published projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'current' or 'historical'
    
    // Only return published projects for public API
    const allProjects = await Projects.getAllProjects({
      published: true,
      orderBy: 'updated_at',
      order: 'desc'
    })

    // Fetch images for each project and add them to the project data
    const projectsWithImages = await Promise.all(
      allProjects.map(async (project) => {
        const images = await ProjectImages.getProjectImages(project.id)
        const imageUrls = images.map(img => convertToInternalMediaUrl(img.url))
        return {
          ...project,
          images: imageUrls
        }
      })
    )

    // Separate projects based on status
    const currentProjects = projectsWithImages.filter(project => project.status !== 'verkauft')
    const historicalProjects = projectsWithImages.filter(project => project.status === 'verkauft')

    // Return filtered results based on category parameter
    if (category === 'current') {
      return NextResponse.json({
        projects: currentProjects,
        total: currentProjects.length
      })
    }
    
    if (category === 'historical') {
      return NextResponse.json({
        projects: historicalProjects,
        total: historicalProjects.length
      })
    }

    // Return both categories if no filter specified
    return NextResponse.json({
      current: currentProjects,
      historical: historicalProjects,
      total: projectsWithImages.length
    })

  } catch (error) {
    console.error('Error fetching public projects:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch projects',
      current: [],
      historical: [],
      total: 0
    }, { status: 500 })
  }
}