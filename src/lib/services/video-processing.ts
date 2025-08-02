import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'
import { createReadStream, createWriteStream, unlink } from 'fs'
import { pipeline } from 'stream'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

const pipelineAsync = promisify(pipeline)

export interface VideoProcessingOptions {
  thumbnailTime?: number // Time in seconds to extract thumbnail (default: 1)
  thumbnailWidth?: number // Width of thumbnail (default: 640)
  thumbnailHeight?: number // Height of thumbnail (default: 360)
  quality?: number // Compression quality 1-100 (default: 80)
}

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  size: number
}

export class VideoProcessingService {
  /**
   * Extract thumbnail from video at specified time
   */
  static async extractThumbnail(
    videoBuffer: Buffer,
    options: VideoProcessingOptions = {}
  ): Promise<Buffer> {
    const {
      thumbnailTime = 1,
      thumbnailWidth = 640,
      thumbnailHeight = 360,
      quality = 80
    } = options

    return new Promise((resolve, reject) => {
      const tempVideoPath = join(tmpdir(), `video_${randomUUID()}.mp4`)
      const tempThumbnailPath = join(tmpdir(), `thumb_${randomUUID()}.jpg`)

      // Write video buffer to temp file
      const writeStream = createWriteStream(tempVideoPath)
      writeStream.write(videoBuffer)
      writeStream.end()

      writeStream.on('finish', () => {
        // Extract thumbnail using ffmpeg
        ffmpeg(tempVideoPath)
          .screenshots({
            timestamps: [thumbnailTime],
            filename: 'thumb.jpg',
            folder: tmpdir(),
            size: `${thumbnailWidth}x${thumbnailHeight}`
          })
          .on('end', async () => {
            try {
              // Read and optimize thumbnail
              const thumbnailBuffer = await sharp(join(tmpdir(), 'thumb.jpg'))
                .jpeg({ quality })
                .toBuffer()

              // Cleanup temp files
              unlink(tempVideoPath, () => {})
              unlink(join(tmpdir(), 'thumb.jpg'), () => {})

              resolve(thumbnailBuffer)
            } catch (error) {
              reject(error)
            }
          })
          .on('error', (error) => {
            // Cleanup temp files
            unlink(tempVideoPath, () => {})
            unlink(join(tmpdir(), 'thumb.jpg'), () => {})
            reject(error)
          })
      })

      writeStream.on('error', reject)
    })
  }

  /**
   * Get video metadata
   */
  static async getMetadata(videoBuffer: Buffer): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const tempVideoPath = join(tmpdir(), `video_${randomUUID()}.mp4`)
      
      // Write video buffer to temp file
      const writeStream = createWriteStream(tempVideoPath)
      writeStream.write(videoBuffer)
      writeStream.end()

      writeStream.on('finish', () => {
        ffmpeg.ffprobe(tempVideoPath, (err, metadata) => {
          // Cleanup temp file
          unlink(tempVideoPath, () => {})

          if (err) {
            reject(err)
            return
          }

          const videoStream = metadata.streams.find(s => s.codec_type === 'video')
          if (!videoStream) {
            reject(new Error('No video stream found'))
            return
          }

          resolve({
            duration: metadata.format.duration || 0,
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            fps: videoStream.r_frame_rate ? eval(videoStream.r_frame_rate.toString()) || 0 : 0,
            bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate.toString()) : 0,
            codec: videoStream.codec_name || 'unknown',
            size: metadata.format.size || 0
          })
        })
      })

      writeStream.on('error', reject)
    })
  }

  /**
   * Compress video for web delivery
   */
  static async compressForWeb(
    videoBuffer: Buffer,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Buffer> {
    const qualitySettings = {
      low: { crf: 28, preset: 'fast', maxrate: '1M', bufsize: '2M' },
      medium: { crf: 23, preset: 'medium', maxrate: '2M', bufsize: '4M' },
      high: { crf: 18, preset: 'slow', maxrate: '4M', bufsize: '8M' }
    }

    const settings = qualitySettings[quality]

    return new Promise((resolve, reject) => {
      const tempInputPath = join(tmpdir(), `input_${randomUUID()}.mp4`)
      const tempOutputPath = join(tmpdir(), `output_${randomUUID()}.mp4`)

      // Write input video
      const writeStream = createWriteStream(tempInputPath)
      writeStream.write(videoBuffer)
      writeStream.end()

      writeStream.on('finish', () => {
        ffmpeg(tempInputPath)
          .outputOptions([
            '-c:v libx264',
            `-crf ${settings.crf}`,
            `-preset ${settings.preset}`,
            `-maxrate ${settings.maxrate}`,
            `-bufsize ${settings.bufsize}`,
            '-c:a aac',
            '-b:a 128k',
            '-movflags +faststart' // Enable progressive download
          ])
          .output(tempOutputPath)
          .on('end', async () => {
            try {
              // Read compressed video
              const compressedBuffer = await new Promise<Buffer>((resolveRead, rejectRead) => {
                const chunks: Buffer[] = []
                const readStream = createReadStream(tempOutputPath)
                
                readStream.on('data', (chunk: Buffer) => chunks.push(chunk))
                readStream.on('end', () => resolveRead(Buffer.concat(chunks)))
                readStream.on('error', rejectRead)
              })

              // Cleanup temp files
              unlink(tempInputPath, () => {})
              unlink(tempOutputPath, () => {})

              resolve(compressedBuffer)
            } catch (error) {
              reject(error)
            }
          })
          .on('error', (error) => {
            // Cleanup temp files
            unlink(tempInputPath, () => {})
            unlink(tempOutputPath, () => {})
            reject(error)
          })
          .run()
      })

      writeStream.on('error', reject)
    })
  }

  /**
   * Generate multiple quality versions of a video
   */
  static async generateMultipleQualities(
    videoBuffer: Buffer
  ): Promise<{
    low: Buffer
    medium: Buffer
    high: Buffer
    thumbnail: Buffer
  }> {
    const [low, medium, high, thumbnail] = await Promise.all([
      this.compressForWeb(videoBuffer, 'low'),
      this.compressForWeb(videoBuffer, 'medium'),
      this.compressForWeb(videoBuffer, 'high'),
      this.extractThumbnail(videoBuffer)
    ])

    return { low, medium, high, thumbnail }
  }

  /**
   * Check if file is a video based on MIME type
   */
  static isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/')
  }

  /**
   * Get optimal video settings based on file size
   */
  static getOptimalSettings(fileSize: number): VideoProcessingOptions & { quality: 'low' | 'medium' | 'high' } {
    // File size in MB
    const sizeMB = fileSize / (1024 * 1024)

    if (sizeMB > 100) {
      return { quality: 'low', thumbnailWidth: 480, thumbnailHeight: 270 }
    } else if (sizeMB > 50) {
      return { quality: 'medium', thumbnailWidth: 640, thumbnailHeight: 360 }
    } else {
      return { quality: 'high', thumbnailWidth: 1280, thumbnailHeight: 720 }
    }
  }
}