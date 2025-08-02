// AI Image Enhancement Service
// Integrates with various AI providers for real estate photo enhancement
//
// Real AI enhancement enabled with OpenAI API
// To add more providers:
// 1. Add additional API keys to environment variables
// 2. Implement provider-specific enhancement methods
// 3. Update preset configurations

import OpenAI from 'openai'
import Replicate from 'replicate'
import sharp from 'sharp'
import { uploadToR2, getFilePath, generateUniqueFilename } from '@/lib/r2-client'
import { convertToInternalMediaUrl } from '@/lib/utils/media-url'

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
}) : null

interface EnhancementOptions {
  provider?: 'openai' | 'replicate'
  operations?: {
    lighting?: boolean
    sky_replacement?: boolean
    hdr_merge?: boolean
    grass_enhancement?: boolean
    perspective_correction?: boolean
    noise_reduction?: boolean
    upscale?: boolean
    quality_boost?: boolean
  }
  quality?: 'standard' | 'premium'
  output_format?: 'jpeg' | 'png' | 'webp'
}

interface EnhancementResult {
  success: boolean
  enhanced_url?: string
  original_url: string
  operations_applied: string[]
  processing_time?: number
  cost?: number
  error?: string
  provider: string
}

export class AIEnhancementService {
  private static readonly DEFAULT_OPTIONS: EnhancementOptions = {
    provider: 'openai',
    operations: {
      lighting: true,
      sky_replacement: false,
      hdr_merge: false,
      grass_enhancement: true,
      perspective_correction: true,
      noise_reduction: true,
      upscale: false,
      quality_boost: true
    },
    quality: 'standard',
    output_format: 'webp'
  }

  /**
   * Enhance a real estate image using AI
   */
  static async enhanceImage(
    imageUrl: string, 
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options }
    
    try {
      switch (config.provider) {
        case 'openai':
          return await this.enhanceWithOpenAI(imageUrl, config)
        case 'replicate':
          return await this.enhanceWithReplicate(imageUrl, config)
        default:
          throw new Error(`Unsupported provider: ${config.provider}. Only 'openai' and 'replicate' are supported.`)
      }
    } catch (error) {
      return {
        success: false,
        original_url: imageUrl,
        operations_applied: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: config.provider || 'unknown'
      }
    }
  }

  /**
   * OpenAI DALL-E 3 integration - Real AI image enhancement
   */
  private static async enhanceWithOpenAI(
    imageUrl: string, 
    options: EnhancementOptions
  ): Promise<EnhancementResult> {
    const startTime = Date.now()
    
    if (!openai) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.')
    }

    try {
      console.log('🤖 Starting real OpenAI enhancement for:', imageUrl)
      
      // Step 1: Download and process the image
      const imageBuffer = await this.downloadImage(imageUrl)
      const processedImageBuffer = await this.prepareImageForOpenAI(imageBuffer)
      
      // Step 2: Upload processed image to temporary location
      const tempImageUrl = await this.uploadTempImage(processedImageBuffer, 'temp-openai')
      
      // Step 3: Generate enhancement prompt
      const prompt = this.generateEnhancementPrompt(options.operations || {})
      console.log('📝 Enhancement prompt:', prompt)
      
      // Step 4: Use OpenAI DALL-E 3 for image editing
      const response = await openai.images.edit({
        image: await fetch(tempImageUrl).then(res => res.arrayBuffer()).then(buf => new File([buf], 'image.png', { type: 'image/png' })),
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No enhanced image returned from OpenAI')
      }

      const enhancedImageUrl = response.data[0].url
      if (!enhancedImageUrl) {
        throw new Error('Enhanced image URL is null')
      }

      // Step 5: Download enhanced image and upload to R2
      const enhancedImageBuffer = await this.downloadImage(enhancedImageUrl)
      const filename = generateUniqueFilename('enhanced', 'png')
      const uploadResult = await uploadToR2(enhancedImageBuffer, filename, 'image/png')
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload enhanced image to storage')
      }

      const finalUrl = convertToInternalMediaUrl(uploadResult.url!)
      const processingTime = Date.now() - startTime
      
      console.log('✅ Real OpenAI enhancement completed:', finalUrl)

      return {
        success: true,
        enhanced_url: finalUrl,
        original_url: imageUrl,
        operations_applied: Object.keys(options.operations || {}).filter(key => 
          options.operations?.[key as keyof typeof options.operations]
        ),
        processing_time: processingTime,
        cost: 0.02, // OpenAI DALL-E 3 pricing
        provider: 'openai'
      }
    } catch (error) {
      console.error('❌ OpenAI enhancement failed:', error)
      throw error
    }
  }

  /**
   * Replicate AI integration - Real estate image enhancement
   */
  private static async enhanceWithReplicate(
    imageUrl: string, 
    options: EnhancementOptions
  ): Promise<EnhancementResult> {
    const startTime = Date.now()
    
    if (!replicate) {
      throw new Error('Replicate API token not configured. Please add REPLICATE_API_TOKEN to your environment variables.')
    }

    try {
      console.log('🤖 Starting Replicate enhancement for:', imageUrl)
      
      // Choose model based on operations
      let model = 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972b7b1-4a4bf3a0'
      
      if (options.operations?.upscale) {
        // Use Real-ESRGAN for upscaling
        model = 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972b7b1-4a4bf3a0'
      } else if (options.operations?.sky_replacement || options.operations?.lighting) {
        // Use GFPGAN for face restoration and general enhancement
        model = 'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3'
      }

      // Run the model
      const output = await replicate.run(model, {
        input: {
          img: imageUrl,
          version: 'v1.4',
          scale: options.operations?.upscale ? 4 : 2,
        }
      })

      if (!output || typeof output !== 'string') {
        throw new Error('No enhanced image returned from Replicate')
      }

      // Download enhanced image and upload to R2
      const enhancedImageBuffer = await this.downloadImage(output)
      const filename = generateUniqueFilename('enhanced-replicate', 'png')
      const uploadResult = await uploadToR2(enhancedImageBuffer, filename, 'image/png')
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload enhanced image to storage')
      }

      const finalUrl = convertToInternalMediaUrl(uploadResult.url!)
      const processingTime = Date.now() - startTime
      
      console.log('✅ Replicate enhancement completed:', finalUrl)

      return {
        success: true,
        enhanced_url: finalUrl,
        original_url: imageUrl,
        operations_applied: Object.keys(options.operations || {}).filter(key => 
          options.operations?.[key as keyof typeof options.operations]
        ),
        processing_time: processingTime,
        cost: 0.005, // Replicate pricing varies by model
        provider: 'replicate'
      }
    } catch (error) {
      console.error('❌ Replicate enhancement failed:', error)
      throw error
    }
  }

  /**
   * Download image from URL
   */
  private static async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error downloading image:', error)
      throw new Error('Failed to download image for processing')
    }
  }

  /**
   * Prepare image for OpenAI (convert to PNG, resize if needed)
   */
  private static async prepareImageForOpenAI(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Convert to PNG and ensure it's under 4MB
      let processedBuffer = await sharp(imageBuffer)
        .png({ quality: 90 })
        .toBuffer()

      // If still too large, resize
      if (processedBuffer.length > 4 * 1024 * 1024) {
        processedBuffer = await sharp(imageBuffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 80 })
          .toBuffer()
      }

      return processedBuffer
    } catch (error) {
      console.error('Error preparing image for OpenAI:', error)
      throw new Error('Failed to prepare image for AI processing')
    }
  }

  /**
   * Upload temporary image for processing
   */
  private static async uploadTempImage(imageBuffer: Buffer, prefix: string): Promise<string> {
    try {
      const filename = generateUniqueFilename(prefix, 'png')
      const uploadResult = await uploadToR2(imageBuffer, filename, 'image/png')
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload temporary image')
      }

      return convertToInternalMediaUrl(uploadResult.url!)
    } catch (error) {
      console.error('Error uploading temporary image:', error)
      throw new Error('Failed to upload temporary image')
    }
  }

  /**
   * Generate enhancement prompt based on selected operations
   */
  private static generateEnhancementPrompt(operations: Record<string, boolean>): string {
    const prompts: string[] = []
    
    if (operations.lighting) {
      prompts.push('improve lighting and brightness')
    }
    if (operations.sky_replacement) {
      prompts.push('enhance the sky with beautiful clouds')
    }
    if (operations.grass_enhancement) {
      prompts.push('make grass and vegetation more vibrant and green')
    }
    if (operations.perspective_correction) {
      prompts.push('correct perspective and straighten the image')
    }
    if (operations.noise_reduction) {
      prompts.push('reduce noise and improve image clarity')
    }
    if (operations.quality_boost) {
      prompts.push('enhance overall image quality and sharpness')
    }
    
    const basePrompt = 'Enhance this real estate photo to make it more appealing for property listings'
    
    if (prompts.length > 0) {
      return `${basePrompt}: ${prompts.join(', ')}`
    }
    
    return `${basePrompt} with professional quality improvements`
  }

  /**
   * Download image from URL as File for OpenAI API
   * OpenAI createVariation accepts PNG files, so we'll pass the original file
   * and let OpenAI handle format conversion if needed
   */
  private static async downloadImageAsFile(imageUrl: string): Promise<File> {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const filename = 'image.png' // Always use PNG filename for OpenAI
    
    return new File([buffer], filename, { 
      type: 'image/png' // Tell OpenAI it's PNG format
    })
  }

  /**
   * Download image from URL as Buffer for upload
   */
  private static async downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download enhanced image: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * AutoEnhance.ai integration - Specialized for real estate
   */
  private static async enhanceWithAutoenhance(
    imageUrl: string, 
    options: EnhancementOptions
  ): Promise<EnhancementResult> {
    // Check if API key is configured
    if (!process.env.AUTOENHANCE_API_KEY || process.env.AUTOENHANCE_API_KEY === 'your-autoenhance-api-key-here') {
      throw new Error('AutoEnhance API key not configured. Please add AUTOENHANCE_API_KEY to your environment variables or use OpenAI provider for demo mode.')
    }
    
    const startTime = Date.now()
    
    // This would integrate with AutoEnhance.ai API
    // For demo purposes, we'll simulate the enhancement
    const simulatedEnhancement = await this.simulateEnhancement(imageUrl, 'autoenhance', options)
    
    const processingTime = Date.now() - startTime
    
    return {
      success: true,
      enhanced_url: simulatedEnhancement.url,
      original_url: imageUrl,  
      operations_applied: [
        'lighting_correction',
        'sky_enhancement', 
        'grass_greening',
        'perspective_correction',
        'noise_reduction',
        'detail_enhancement'
      ],
      processing_time: processingTime,
      cost: 0.05, // $0.05 per image as mentioned in research
      provider: 'autoenhance'
    }
  }

  /**
   * Deep-Image.ai integration - High resolution upscaling
   */
  private static async enhanceWithDeepImage(
    imageUrl: string, 
    options: EnhancementOptions
  ): Promise<EnhancementResult> {
    // Check if API key is configured
    if (!process.env.DEEP_IMAGE_API_KEY || process.env.DEEP_IMAGE_API_KEY === 'your-deep-image-api-key-here') {
      throw new Error('Deep Image API key not configured. Please add DEEP_IMAGE_API_KEY to your environment variables or use OpenAI provider for demo mode.')
    }
    
    const startTime = Date.now()
    
    const simulatedEnhancement = await this.simulateEnhancement(imageUrl, 'deep-image', options)
    
    const processingTime = Date.now() - startTime
    
    return {
      success: true,
      enhanced_url: simulatedEnhancement.url,
      original_url: imageUrl,
      operations_applied: [
        'upscale_4k',
        'detail_enhancement',
        'noise_reduction',
        'sharpening'
      ],
      processing_time: processingTime,
      cost: 0.10, // Higher cost for upscaling
      provider: 'deep-image'
    }
  }

  /**
   * Imagen AI integration - Professional real estate editing
   */
  private static async enhanceWithImagen(
    imageUrl: string, 
    options: EnhancementOptions
  ): Promise<EnhancementResult> {
    const startTime = Date.now()
    
    const simulatedEnhancement = await this.simulateEnhancement(imageUrl, 'imagen', options)
    
    const processingTime = Date.now() - startTime
    
    return {
      success: true,
      enhanced_url: simulatedEnhancement.url,
      original_url: imageUrl,
      operations_applied: [
        'professional_color_grading',
        'hdr_processing',
        'sky_replacement',
        'lighting_optimization',
        'perspective_correction'
      ],
      processing_time: processingTime,
      cost: 0.06, // $0.05 base + $0.01 for additional features
      provider: 'imagen'
    }
  }

  /**
   * Simulate AI enhancement (replace with actual API calls)
   */
  private static async simulateEnhancement(
    imageUrl: string, 
    provider: string, 
    options: EnhancementOptions
  ): Promise<{ url: string }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    // In a real implementation, this would:
    // 1. Download the original image from imageUrl
    // 2. Send it to the AI provider's API
    // 3. Receive the enhanced image
    // 4. Upload the enhanced image to R2/S3
    // 5. Return the new URL
    
    console.log('🎨 AI Enhancement Simulation:')
    console.log(`  Original: ${imageUrl}`)
    console.log(`  Provider: ${provider}`)
    console.log(`  Operations: ${JSON.stringify(options.operations)}`)
    
    // For simulation, add URL parameters to show "enhancement"
    const url = new URL(imageUrl)
    url.searchParams.set('enhanced', 'true')
    url.searchParams.set('provider', provider)
    url.searchParams.set('timestamp', Date.now().toString())
    
    // Add specific enhancement parameters based on operations
    if (options.operations?.lighting) url.searchParams.set('lighting', 'improved')
    if (options.operations?.sky_replacement) url.searchParams.set('sky', 'enhanced')
    if (options.operations?.upscale) url.searchParams.set('resolution', '4k')
    if (options.operations?.noise_reduction) url.searchParams.set('noise', 'reduced')
    
    const enhancedUrl = url.toString()
    console.log(`  Enhanced: ${enhancedUrl}`)
    
    return { url: enhancedUrl }
  }

  /**
   * Batch enhance multiple images
   */
  static async batchEnhance(
    imageUrls: string[], 
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult[]> {
    const results = await Promise.allSettled(
      imageUrls.map(url => this.enhanceImage(url, options))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          success: false,
          original_url: imageUrls[index],
          operations_applied: [],
          error: result.reason?.message || 'Enhancement failed',
          provider: options.provider || 'unknown'
        }
      }
    })
  }

  /**
   * Get enhancement presets for different use cases
   */
  static getPresets(): Record<string, EnhancementOptions> {
    return {
      'ai_professional': {
        provider: 'openai',
        operations: {
          lighting: true,
          sky_replacement: true,
          grass_enhancement: true,
          perspective_correction: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'premium',
        output_format: 'png'
      },
      'ai_quick_enhance': {
        provider: 'openai',
        operations: {
          lighting: true,
          quality_boost: true,
          noise_reduction: true
        },
        quality: 'standard',
        output_format: 'png'
      },
      'real_estate_standard': {
        provider: 'openai',
        operations: {
          lighting: true,
          sky_replacement: false,
          grass_enhancement: true,
          perspective_correction: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'standard',
        output_format: 'png'
      },
      'real_estate_premium': {
        provider: 'openai',
        operations: {
          lighting: true,
          sky_replacement: true,
          hdr_merge: true,
          grass_enhancement: true,
          perspective_correction: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'premium',
        output_format: 'png'
      },
      'high_resolution': {
        provider: 'openai',
        operations: {
          upscale: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'premium',
        output_format: 'png'
      },
      'quick_fix': {
        provider: 'openai',
        operations: {
          lighting: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'standard',
        output_format: 'png'
      },
      'replicate_upscale': {
        provider: 'replicate',
        operations: {
          upscale: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'premium',
        output_format: 'png'
      },
      'replicate_enhance': {
        provider: 'replicate',
        operations: {
          lighting: true,
          noise_reduction: true,
          quality_boost: true
        },
        quality: 'standard',
        output_format: 'png'
      }
    }
  }

  /**
   * Estimate enhancement cost for a batch of images
   */
  static estimateCost(
    imageCount: number, 
    options: EnhancementOptions = {}
  ): { totalCost: number; costPerImage: number; provider: string } {
    const config = { ...this.DEFAULT_OPTIONS, ...options }
    
    let costPerImage = 0.05 // Default AutoEnhance cost
    
    switch (config.provider) {
      case 'openai':
        costPerImage = 0.02 // OpenAI DALL-E 3 edit pricing
        break
      case 'replicate':
        costPerImage = 0.005 // Replicate varies by model, this is average
        break
      case 'autoenhance':
        costPerImage = 0.05
        break
      case 'imagen':
        costPerImage = 0.06 // Base + additional features
        break
      case 'deep-image':
        costPerImage = 0.10 // Higher for upscaling
        break
    }
    
    // Additional cost for premium operations
    if (config.operations?.upscale) costPerImage += 0.05
    if (config.operations?.sky_replacement) costPerImage += 0.02
    if (config.operations?.hdr_merge) costPerImage += 0.03
    
    return {
      totalCost: imageCount * costPerImage,
      costPerImage,
      provider: config.provider || 'autoenhance'
    }
  }
}