// Basic Image Editing Service - Crop, Rotate, Resize
// Provides essential image editing capabilities using Sharp

import sharp from 'sharp'
import { uploadToR2, generateUniqueFilename } from '@/lib/r2-client'
import { StoragePaths } from '@/lib/utils/storage-paths'

interface CropOptions {
  x: number // Left offset in pixels
  y: number // Top offset in pixels  
  width: number // Crop width in pixels
  height: number // Crop height in pixels
}

interface ResizeOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  preserveAspectRatio?: boolean
  quality?: number
}

interface RotateOptions {
  angle: number // Rotation angle in degrees (0, 90, 180, 270)
  backgroundColor?: string // Background color for areas outside the rotated image
}

interface AdjustOptions {
  brightness?: number // Brightness adjustment (-100 to 100)
  contrast?: number // Contrast adjustment (-100 to 100)
  saturation?: number // Saturation adjustment (-100 to 100)
  hue?: number // Hue adjustment (-180 to 180)
  exposure?: number // Exposure adjustment (-100 to 100)
  highlights?: number // Highlights adjustment (-100 to 100)
  shadows?: number // Shadows adjustment (-100 to 100)
  flipHorizontal?: boolean // Flip horizontally
  flipVertical?: boolean // Flip vertically
}

interface EditResult {
  success: boolean
  original_url: string
  edited_url?: string
  operations_applied: string[]
  error?: string
  metadata?: {
    originalDimensions: { width: number; height: number }
    newDimensions: { width: number; height: number }
    fileSize: number
  }
}

export class ImageEditorService {
  
  /**
   * Download image from URL and return buffer with metadata
   */
  private static async downloadImageWithMetadata(imageUrl: string): Promise<{
    buffer: Buffer
    metadata: sharp.Metadata
  }> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const metadata = await sharp(buffer).metadata()
      
      return { buffer, metadata }
    } catch (error) {
      console.error('Error downloading image:', error)
      throw new Error('Failed to download image for editing')
    }
  }

  /**
   * Crop image to specified dimensions
   */
  static async cropImage(
    imageUrl: string,
    cropOptions: CropOptions,
    projectId?: string
  ): Promise<EditResult> {
    try {
      console.log('✂️ Cropping image:', imageUrl, cropOptions)
      
      const { buffer, metadata } = await this.downloadImageWithMetadata(imageUrl)
      
      // Validate crop parameters
      if (cropOptions.x < 0 || cropOptions.y < 0 || 
          cropOptions.width <= 0 || cropOptions.height <= 0) {
        throw new Error('Invalid crop parameters')
      }
      
      if (metadata.width && metadata.height) {
        if (cropOptions.x + cropOptions.width > metadata.width ||
            cropOptions.y + cropOptions.height > metadata.height) {
          throw new Error('Crop area exceeds image boundaries')
        }
      }

      // Perform crop operation
      const croppedBuffer = await sharp(buffer)
        .extract({
          left: Math.round(cropOptions.x),
          top: Math.round(cropOptions.y),
          width: Math.round(cropOptions.width),
          height: Math.round(cropOptions.height)
        })
        .png({ quality: 95 })
        .toBuffer()

      // Upload cropped image
      const filename = generateUniqueFilename('cropped-image.png')
      const filePath = projectId 
        ? StoragePaths.projectEdited(projectId, filename)
        : `edited/${filename}` // fallback to legacy path
      const editedUrl = await uploadToR2(croppedBuffer, filePath, 'image/png')
      
      // Get new metadata
      const newMetadata = await sharp(croppedBuffer).metadata()

      return {
        success: true,
        original_url: imageUrl,
        edited_url: editedUrl,
        operations_applied: ['crop'],
        metadata: {
          originalDimensions: { 
            width: metadata.width || 0, 
            height: metadata.height || 0 
          },
          newDimensions: { 
            width: newMetadata.width || 0, 
            height: newMetadata.height || 0 
          },
          fileSize: croppedBuffer.length
        }
      }

    } catch (error) {
      console.error('Crop operation failed:', error)
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Crop operation failed'
      }
    }
  }

  /**
   * Resize image with various fit options
   */
  static async resizeImage(
    imageUrl: string,
    resizeOptions: ResizeOptions,
    projectId?: string
  ): Promise<EditResult> {
    try {
      console.log('🔧 Resizing image:', imageUrl, resizeOptions)
      
      const { buffer, metadata } = await this.downloadImageWithMetadata(imageUrl)
      
      // Default options
      const config = {
        fit: 'inside' as const,
        preserveAspectRatio: true,
        quality: 90,
        ...resizeOptions
      }

      // Validate resize parameters
      if (config.width && config.width <= 0) {
        throw new Error('Width must be positive')
      }
      if (config.height && config.height <= 0) {
        throw new Error('Height must be positive')
      }
      if (!config.width && !config.height) {
        throw new Error('Either width or height must be specified')
      }

      // Build resize options for Sharp
      const sharpResizeOptions: any = {
        fit: config.fit,
        withoutEnlargement: false
      }

      // Perform resize operation
      let sharpInstance = sharp(buffer)
      
      if (config.width && config.height) {
        sharpInstance = sharpInstance.resize(config.width, config.height, sharpResizeOptions)
      } else if (config.width) {
        sharpInstance = sharpInstance.resize(config.width, null, sharpResizeOptions)
      } else if (config.height) {
        sharpInstance = sharpInstance.resize(null, config.height, sharpResizeOptions)
      }

      const resizedBuffer = await sharpInstance
        .png({ quality: config.quality })
        .toBuffer()

      // Upload resized image
      const filename = generateUniqueFilename('resized-image.png')
      const filePath = projectId 
        ? StoragePaths.projectEdited(projectId, filename)
        : `edited/${filename}` // fallback to legacy path
      const editedUrl = await uploadToR2(resizedBuffer, filePath, 'image/png')
      
      // Get new metadata
      const newMetadata = await sharp(resizedBuffer).metadata()

      return {
        success: true,
        original_url: imageUrl,
        edited_url: editedUrl,
        operations_applied: ['resize'],
        metadata: {
          originalDimensions: { 
            width: metadata.width || 0, 
            height: metadata.height || 0 
          },
          newDimensions: { 
            width: newMetadata.width || 0, 
            height: newMetadata.height || 0 
          },
          fileSize: resizedBuffer.length
        }
      }

    } catch (error) {
      console.error('Resize operation failed:', error)
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Resize operation failed'
      }
    }
  }

  /**
   * Rotate image by specified angle
   */
  static async rotateImage(
    imageUrl: string,
    rotateOptions: RotateOptions,
    projectId?: string
  ): Promise<EditResult> {
    try {
      console.log('🔄 Rotating image:', imageUrl, rotateOptions)
      
      const { buffer, metadata } = await this.downloadImageWithMetadata(imageUrl)
      
      // Validate rotation angle
      const validAngles = [0, 90, 180, 270, -90, -180, -270]
      if (!validAngles.includes(rotateOptions.angle)) {
        throw new Error('Rotation angle must be 0, 90, 180, or 270 degrees')
      }

      // Normalize angle to positive values
      let normalizedAngle = rotateOptions.angle
      if (normalizedAngle < 0) {
        normalizedAngle = 360 + normalizedAngle
      }

      // Default background color for rotation
      const backgroundColor = rotateOptions.backgroundColor || '#ffffff'

      // Perform rotation operation
      const rotatedBuffer = await sharp(buffer)
        .rotate(normalizedAngle, { background: backgroundColor })
        .png({ quality: 95 })
        .toBuffer()

      // Upload rotated image
      const filename = generateUniqueFilename('rotated-image.png')
      const filePath = projectId 
        ? StoragePaths.projectEdited(projectId, filename)
        : `edited/${filename}` // fallback to legacy path
      const editedUrl = await uploadToR2(rotatedBuffer, filePath, 'image/png')
      
      // Get new metadata
      const newMetadata = await sharp(rotatedBuffer).metadata()

      return {
        success: true,
        original_url: imageUrl,
        edited_url: editedUrl,
        operations_applied: [`rotate_${rotateOptions.angle}deg`],
        metadata: {
          originalDimensions: { 
            width: metadata.width || 0, 
            height: metadata.height || 0 
          },
          newDimensions: { 
            width: newMetadata.width || 0, 
            height: newMetadata.height || 0 
          },
          fileSize: rotatedBuffer.length
        }
      }

    } catch (error) {
      console.error('Rotate operation failed:', error)
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Rotate operation failed'
      }
    }
  }

  /**
   * Apply color and tonal adjustments to image
   */
  static async adjustImage(
    imageUrl: string,
    adjustOptions: AdjustOptions,
    projectId?: string
  ): Promise<EditResult> {
    try {
      console.log('🎨 Adjusting image:', imageUrl, adjustOptions)
      
      const { buffer, metadata } = await this.downloadImageWithMetadata(imageUrl)
      
      let sharpInstance = sharp(buffer)
      const appliedOperations: string[] = []

      // Apply flip operations first
      if (adjustOptions.flipHorizontal) {
        sharpInstance = sharpInstance.flop()
        appliedOperations.push('flip_horizontal')
      }
      
      if (adjustOptions.flipVertical) {
        sharpInstance = sharpInstance.flip()
        appliedOperations.push('flip_vertical')
      }

      // Apply color adjustments
      const modulate: any = {}
      
      if (adjustOptions.brightness !== undefined && adjustOptions.brightness !== 0) {
        // Sharp brightness is multiplier based (1 = no change, >1 = brighter, <1 = darker)
        modulate.brightness = 1 + (adjustOptions.brightness / 100)
        appliedOperations.push(`brightness_${adjustOptions.brightness > 0 ? '+' : ''}${adjustOptions.brightness}`)
      }
      
      if (adjustOptions.saturation !== undefined && adjustOptions.saturation !== 0) {
        // Sharp saturation is multiplier based (1 = no change, >1 = more saturated, <1 = less saturated)
        modulate.saturation = 1 + (adjustOptions.saturation / 100)
        appliedOperations.push(`saturation_${adjustOptions.saturation > 0 ? '+' : ''}${adjustOptions.saturation}`)
      }
      
      if (adjustOptions.hue !== undefined && adjustOptions.hue !== 0) {
        // Sharp hue is in degrees
        modulate.hue = adjustOptions.hue
        appliedOperations.push(`hue_${adjustOptions.hue > 0 ? '+' : ''}${adjustOptions.hue}deg`)
      }

      // Apply modulate if any adjustments
      if (Object.keys(modulate).length > 0) {
        sharpInstance = sharpInstance.modulate(modulate)
      }

      // Apply contrast using gamma (approximation)
      if (adjustOptions.contrast !== undefined && adjustOptions.contrast !== 0) {
        if (adjustOptions.contrast > 0) {
          // Increase contrast: gamma between 1.0 and 3.0
          const gamma = 1 + (adjustOptions.contrast / 100) * 2 // Map 0-100 to 1.0-3.0
          sharpInstance = sharpInstance.gamma(gamma)
          appliedOperations.push(`contrast_+${adjustOptions.contrast}`)
        } else {
          // Decrease contrast: use linear adjustment instead of gamma for negative values
          // Sharp's linear() can handle contrast reduction better
          const factor = 1 + (adjustOptions.contrast / 100) // 0.0 to 1.0 for -100 to 0
          sharpInstance = sharpInstance.linear(factor, 0)
          appliedOperations.push(`contrast_${adjustOptions.contrast}`)
        }
      }

      // Note: Sharp doesn't have direct exposure, highlights, shadows adjustments
      // These would require more complex operations or different libraries
      if (adjustOptions.exposure !== undefined && adjustOptions.exposure !== 0) {
        // Approximate exposure with brightness
        const exposureMultiplier = 1 + (adjustOptions.exposure / 100)
        sharpInstance = sharpInstance.linear(exposureMultiplier, 0)
        appliedOperations.push(`exposure_${adjustOptions.exposure > 0 ? '+' : ''}${adjustOptions.exposure}`)
      }

      const adjustedBuffer = await sharpInstance
        .png({ quality: 95 })
        .toBuffer()

      // Upload adjusted image
      const filename = generateUniqueFilename('adjusted-image.png')
      const filePath = projectId 
        ? StoragePaths.projectEdited(projectId, filename)
        : `edited/${filename}` // fallback to legacy path
      const editedUrl = await uploadToR2(adjustedBuffer, filePath, 'image/png')
      
      // Get new metadata
      const newMetadata = await sharp(adjustedBuffer).metadata()

      return {
        success: true,
        original_url: imageUrl,
        edited_url: editedUrl,
        operations_applied: appliedOperations,
        metadata: {
          originalDimensions: { 
            width: metadata.width || 0, 
            height: metadata.height || 0 
          },
          newDimensions: { 
            width: newMetadata.width || 0, 
            height: newMetadata.height || 0 
          },
          fileSize: adjustedBuffer.length
        }
      }

    } catch (error) {
      console.error('Adjust operation failed:', error)
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Adjust operation failed'
      }
    }
  }

  /**
   * Perform multiple editing operations in sequence
   */
  static async performMultipleEdits(
    imageUrl: string,
    operations: Array<{
      type: 'crop' | 'resize' | 'rotate' | 'adjust'
      options: CropOptions | ResizeOptions | RotateOptions | AdjustOptions
    }>,
    projectId?: string
  ): Promise<EditResult> {
    try {
      console.log('🎨 Performing multiple edits:', imageUrl, operations)
      
      let currentUrl = imageUrl
      const allOperations: string[] = []
      let finalMetadata: any = null

      for (const operation of operations) {
        let result: EditResult

        switch (operation.type) {
          case 'crop':
            result = await this.cropImage(currentUrl, operation.options as CropOptions, projectId)
            break
          case 'resize':
            result = await this.resizeImage(currentUrl, operation.options as ResizeOptions, projectId)
            break
          case 'rotate':
            result = await this.rotateImage(currentUrl, operation.options as RotateOptions, projectId)
            break
          case 'adjust':
            result = await this.adjustImage(currentUrl, operation.options as AdjustOptions, projectId)
            break
          default:
            throw new Error(`Unknown operation type: ${operation.type}`)
        }

        if (!result.success) {
          throw new Error(result.error || `${operation.type} operation failed`)
        }

        currentUrl = result.edited_url!
        allOperations.push(...result.operations_applied)
        finalMetadata = result.metadata
      }

      return {
        success: true,
        original_url: imageUrl,
        edited_url: currentUrl,
        operations_applied: allOperations,
        metadata: finalMetadata
      }

    } catch (error) {
      console.error('Multiple edits failed:', error)
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Multiple edit operations failed'
      }
    }
  }

  /**
   * Get image metadata without editing
   */
  static async getImageMetadata(imageUrl: string): Promise<{
    success: boolean
    metadata?: {
      width: number
      height: number
      format: string
      size: number
      hasAlpha: boolean
      colorSpace: string
    }
    error?: string
  }> {
    try {
      const { metadata } = await this.downloadImageWithMetadata(imageUrl)
      
      return {
        success: true,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown',
          size: metadata.size || 0,
          hasAlpha: metadata.hasAlpha || false,
          colorSpace: metadata.space || 'unknown'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get image metadata'
      }
    }
  }
}