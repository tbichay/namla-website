import { eq, desc, asc } from 'drizzle-orm'
import { db, projects, projectImages, type Project, type NewProject, type ProjectImage, type NewProjectImage } from '@/lib/db'
import { uploadToR2, deleteFromR2, getFilePath, generateUniqueFilename } from '@/lib/r2-client'

// Project CRUD operations
export class ProjectService {
  // Get all projects with optional filters
  static async getAllProjects(options?: {
    published?: boolean
    status?: string
    orderBy?: 'created_at' | 'updated_at' | 'name'
    order?: 'asc' | 'desc'
  }) {
    const { published, status, orderBy = 'updated_at', order = 'desc' } = options || {}
    
    let query = db.select().from(projects)

    // Apply filters
    const conditions = []
    if (published !== undefined) {
      conditions.push(eq(projects.isPublished, published))
    }
    if (status) {
      conditions.push(eq(projects.status, status as any))
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : conditions.reduce((acc, cond) => acc && cond))
    }

    // Apply ordering
    const orderFn = order === 'asc' ? asc : desc
    
    // Map orderBy string to actual column
    const orderColumn = orderBy === 'created_at' ? projects.createdAt 
                      : orderBy === 'updated_at' ? projects.updatedAt 
                      : projects.name
    
    query = query.orderBy(orderFn(orderColumn))

    return await query
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
    return result[0] || null
  }

  // Get project by slug
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
    return result[0] || null
  }

  // Create project
  static async createProject(data: Omit<NewProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: NewProject = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.insert(projects).values(newProject).returning()
    return result[0]
  }

  // Update project
  static async updateProject(id: string, data: Partial<NewProject>): Promise<Project | null> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    }

    const result = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning()

    return result[0] || null
  }

  // Delete project
  static async deleteProject(id: string): Promise<boolean> {
    // First delete associated images from R2
    const projectImages = await this.getProjectImages(id)
    for (const image of projectImages) {
      try {
        const key = image.url.split('/').pop() // Extract key from URL
        if (key) {
          await deleteFromR2(getFilePath('projects', key))
        }
      } catch (error) {
        console.error('Error deleting image from R2:', error)
      }
    }

    // Delete project (images will be cascade deleted)
    const result = await db.delete(projects).where(eq(projects.id, id)).returning()
    return result.length > 0
  }

  // Generate unique slug
  static async generateSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await this.getProjectBySlug(slug)
      if (!existing) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  // Toggle project publication status
  static async togglePublication(id: string): Promise<Project | null> {
    const project = await this.getProjectById(id)
    if (!project) return null

    const publishedAt = !project.isPublished ? new Date() : null
    
    return await this.updateProject(id, {
      isPublished: !project.isPublished,
      publishedAt
    })
  }
}

// Project Images CRUD operations
export class ProjectImageService {
  // Get images for a project
  static async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const images = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId))
      .orderBy(asc(projectImages.sortOrder), asc(projectImages.createdAt))
    
    // Ensure main image is always first
    const mainImage = images.find(img => img.isMainImage)
    const otherImages = images.filter(img => !img.isMainImage)
    
    return mainImage ? [mainImage, ...otherImages] : images
  }

  // Upload and create project image
  static async uploadProjectImage(
    projectId: string,
    file: Buffer,
    filename: string,
    options?: {
      alt?: string
      caption?: string
      isMainImage?: boolean
      contentType?: string
    }
  ): Promise<ProjectImage> {
    const { alt, caption, isMainImage = false, contentType } = options || {}
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename)
    const filePath = getFilePath('projects', uniqueFilename)
    
    // Upload to R2
    const url = await uploadToR2(file, filePath, contentType)
    
    // If this is set as main image, unset others
    if (isMainImage) {
      await db
        .update(projectImages)
        .set({ isMainImage: false })
        .where(eq(projectImages.projectId, projectId))
    }
    
    // Create database record (without mediaType for now)
    const imageData: NewProjectImage = {
      projectId,
      filename: uniqueFilename,
      originalName: filename,
      url,
      alt,
      caption,
      isMainImage,
      createdAt: new Date()
    }
    
    const result = await db.insert(projectImages).values(imageData).returning()
    return result[0]
  }

  // Get project image by ID
  static async getProjectImageById(id: string): Promise<ProjectImage | null> {
    const result = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1)
    return result[0] || null
  }

  // Update image metadata
  static async updateProjectImage(
    id: string,
    data: Partial<Pick<ProjectImage, 'alt' | 'caption' | 'isMainImage' | 'sortOrder'>>
  ): Promise<ProjectImage | null> {
    // If setting as main image, unset others first
    if (data.isMainImage) {
      const image = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1)
      if (image[0]) {
        await db
          .update(projectImages)
          .set({ isMainImage: false })
          .where(eq(projectImages.projectId, image[0].projectId))
      }
    }

    const result = await db
      .update(projectImages)
      .set(data)
      .where(eq(projectImages.id, id))
      .returning()

    return result[0] || null
  }

  // Update image URL after editing (preserves original URL)
  static async updateProjectImageUrl(
    id: string,
    newUrl: string,
    editMetadata?: {
      operations?: string[]
      editedAt?: Date
    }
  ): Promise<ProjectImage | null> {
    // Get current image to preserve original URL
    const currentImage = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1)
    if (!currentImage[0]) return null

    // If this is the first edit, preserve the current URL as originalUrl
    const originalUrl = currentImage[0].originalUrl || currentImage[0].url

    const updateData: any = {
      url: newUrl,
      originalUrl: originalUrl
    }

    const result = await db
      .update(projectImages)
      .set(updateData)
      .where(eq(projectImages.id, id))
      .returning()

    return result[0] || null
  }

  // Revert image to original URL
  static async revertProjectImageToOriginal(id: string): Promise<ProjectImage | null> {
    const currentImage = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1)
    if (!currentImage[0] || !currentImage[0].originalUrl) return null

    const result = await db
      .update(projectImages)
      .set({
        url: currentImage[0].originalUrl
      })
      .where(eq(projectImages.id, id))
      .returning()

    return result[0] || null
  }

  // Delete project image
  static async deleteProjectImage(id: string): Promise<boolean> {
    const image = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1)
    if (!image[0]) return false

    try {
      // Delete from R2
      const key = image[0].url.split('/').pop()
      if (key) {
        await deleteFromR2(getFilePath('projects', key))
      }
    } catch (error) {
      console.error('Error deleting image from R2:', error)
    }

    // Delete from database
    const result = await db.delete(projectImages).where(eq(projectImages.id, id)).returning()
    return result.length > 0
  }

  // Reorder images
  static async reorderImages(imageOrders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const { id, sortOrder } of imageOrders) {
      await db
        .update(projectImages)
        .set({ sortOrder })
        .where(eq(projectImages.id, id))
    }
  }
}

// Helper function to determine media type from filename
export function getMediaTypeFromFilename(filename: string): 'image' | 'video' {
  const extension = filename.toLowerCase().split('.').pop() || ''
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv']
  return videoExtensions.includes(extension) ? 'video' : 'image'
}

// Export both services for convenience
export { ProjectService as Projects, ProjectImageService as ProjectImages }