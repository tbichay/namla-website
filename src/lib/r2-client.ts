import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Environment validation
const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// R2 Client configuration
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Get storage prefix based on current branch
export const getStoragePrefix = (): string => {
  // Priority: GitHub head ref > GitHub ref name > local branch env > Vercel git ref > fallback to main
  // Note: BRANCH_NAME is prioritized over VERCEL_GIT_COMMIT_REF because it's managed by our branch setup
  const branch = 
    process.env.GITHUB_HEAD_REF || 
    process.env.GITHUB_REF_NAME?.replace('refs/heads/', '') ||
    process.env.BRANCH_NAME ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    'main'
  
  const prefix = branch === 'main' ? 'main' : `branch-${branch}`
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 R2 Storage Debug:', {
      GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
      GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      BRANCH_NAME: process.env.BRANCH_NAME,
      detected_branch: branch,
      storage_prefix: prefix
    })
  }
  
  return prefix
}

// Generate file path with branch prefix (legacy - use storage-paths.ts for new code)
export const getFilePath = (folder: string, filename: string): string => {
  const prefix = getStoragePrefix()
  return `${prefix}/${folder}/${filename}`
}

// Upload file to R2
export const uploadToR2 = async (
  file: Buffer | Uint8Array | string,
  key: string,
  contentType?: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await r2Client.send(command)
  
  // Check if we have a custom domain configured for public access
  if (process.env.R2_PUBLIC_DOMAIN) {
    return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`
  }
  
  // Use our internal API route to serve the media
  // This works regardless of R2 bucket permissions
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/api/media/${key}`
}

// Delete file from R2
export const deleteFromR2 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })

  await r2Client.send(command)
}

// Generate signed URL for temporary access
export const getSignedUrlForUpload = async (
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

// Generate signed URL for download
export const getSignedUrlForDownload = async (
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

// Helper function to extract filename from path
export const extractFilenameFromPath = (path: string): string => {
  return path.split('/').pop() || path
}

// Helper function to generate unique filename
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExt}-${timestamp}.${extension}`
}

// Get public URL for a file (if bucket is configured for public access)
export const getPublicUrl = (key: string): string => {
  return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
}

export default r2Client