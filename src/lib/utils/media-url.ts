/**
 * Utility functions for handling media URLs
 */

// Convert R2 direct URLs to use our internal API route
export function convertToInternalMediaUrl(url: string): string {
  // Check if it's already an internal URL
  if (url.includes('/api/media/')) {
    return url
  }

  // Check if it's an R2 direct URL that needs conversion
  const r2Pattern = /https:\/\/[^\/]+\.r2\.cloudflarestorage\.com\/(.+)/
  const match = url.match(r2Pattern)
  
  if (match) {
    const filePath = match[1]
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return `${baseUrl}/api/media/${filePath}`
  }

  // If it's already a custom domain or other URL, return as-is
  return url
}

// Get the file key from any media URL
export function extractFileKeyFromUrl(url: string): string | null {
  // Internal API route
  const internalMatch = url.match(/\/api\/media\/(.+)/)
  if (internalMatch) {
    return internalMatch[1]
  }

  // R2 direct URL
  const r2Match = url.match(/https:\/\/[^\/]+\.r2\.cloudflarestorage\.com\/(.+)/)
  if (r2Match) {
    return r2Match[1]
  }

  // Custom domain
  if (process.env.R2_PUBLIC_DOMAIN && url.includes(process.env.R2_PUBLIC_DOMAIN)) {
    const customMatch = url.match(`https://${process.env.R2_PUBLIC_DOMAIN}/(.+)`)
    if (customMatch) {
      return customMatch[1]
    }
  }

  return null
}

// Check if a URL is a media URL that we can serve
export function isInternalMediaUrl(url: string): boolean {
  return url.includes('/api/media/') || 
         url.includes('.r2.cloudflarestorage.com/') ||
         (process.env.R2_PUBLIC_DOMAIN ? url.includes(process.env.R2_PUBLIC_DOMAIN) : false)
}