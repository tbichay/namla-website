// Centralized storage path management for R2
// Provides project-aware, versioned storage structure

import { getStoragePrefix } from '@/lib/r2-client'

export type StorageContext = 'original' | 'edited' | 'ai-enhanced' | 'versions' | 'reference' | 'temp'

interface ProjectPathOptions {
  projectId: string
  context: StorageContext
  filename: string
  version?: string
}

interface GlobalPathOptions {
  context: 'reference' | 'temp'
  filename: string
}

/**
 * Generate project-specific storage path
 * Structure: {branch}/projects/{projectId}/{context}/{filename}
 */
export const getProjectStoragePath = ({ projectId, context, filename, version }: ProjectPathOptions): string => {
  const prefix = getStoragePrefix()
  
  if (context === 'versions' && version) {
    return `${prefix}/projects/${projectId}/versions/${version}/${filename}`
  }
  
  return `${prefix}/projects/${projectId}/${context}/${filename}`
}

/**
 * Generate global storage path for shared resources
 * Structure: {branch}/global/{context}/{filename}
 */
export const getGlobalStoragePath = ({ context, filename }: GlobalPathOptions): string => {
  const prefix = getStoragePrefix()
  return `${prefix}/global/${context}/${filename}`
}

/**
 * Extract project info from storage path
 */
export const parseProjectPath = (path: string): { projectId?: string; context?: string; filename?: string; version?: string } => {
  const parts = path.split('/')
  
  // Expected format: {branch}/projects/{projectId}/{context}/{filename}
  // Or for versions: {branch}/projects/{projectId}/versions/{version}/{filename}
  if (parts.length >= 5 && parts[1] === 'projects') {
    const projectId = parts[2]
    const context = parts[3]
    
    if (context === 'versions' && parts.length >= 6) {
      return {
        projectId,
        context,
        version: parts[4],
        filename: parts[5]
      }
    }
    
    return {
      projectId,
      context,
      filename: parts[4]
    }
  }
  
  return {}
}

/**
 * Generate version identifier for edited images
 */
export const generateVersionId = (): string => {
  return `v${Date.now()}`
}

/**
 * Legacy path functions for backward compatibility during migration
 */
export const getLegacyPath = (folder: string, filename: string): string => {
  const prefix = getStoragePrefix()
  return `${prefix}/${folder}/${filename}`
}

/**
 * Check if a path uses the new project structure
 */
export const isProjectPath = (path: string): boolean => {
  return path.includes('/projects/') && path.split('/').length >= 5
}

/**
 * Convert legacy path to new project path
 */
export const migrateLegacyPath = (legacyPath: string, projectId: string): string | null => {
  const parts = legacyPath.split('/')
  
  if (parts.length < 3) return null
  
  const folder = parts[parts.length - 2]
  const filename = parts[parts.length - 1]
  
  // Map legacy folders to new contexts
  const contextMap: Record<string, StorageContext> = {
    'projects': 'original',
    'edited': 'edited', 
    'enhanced': 'ai-enhanced'
  }
  
  const context = contextMap[folder]
  if (!context) return null
  
  return getProjectStoragePath({ projectId, context, filename })
}

/**
 * Storage path helpers for common operations
 */
export const StoragePaths = {
  // Project image paths
  projectOriginal: (projectId: string, filename: string) => 
    getProjectStoragePath({ projectId, context: 'original', filename }),
    
  projectEdited: (projectId: string, filename: string) => 
    getProjectStoragePath({ projectId, context: 'edited', filename }),
    
  projectAiEnhanced: (projectId: string, filename: string) => 
    getProjectStoragePath({ projectId, context: 'ai-enhanced', filename }),
    
  projectVersion: (projectId: string, version: string, filename: string) => 
    getProjectStoragePath({ projectId, context: 'versions', version, filename }),
  
  // Global paths
  referenceImage: (filename: string) => 
    getGlobalStoragePath({ context: 'reference', filename }),
    
  tempFile: (filename: string) => 
    getGlobalStoragePath({ context: 'temp', filename })
}