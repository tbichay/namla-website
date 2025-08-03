'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image' 
import { toast } from 'react-hot-toast'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  alt?: string
  caption?: string
  isMainImage?: boolean
  error?: string
}

interface UploadedMedia {
  id: string
  url: string
  filename: string
  originalName: string
  mediaType: 'image' | 'video'
  alt?: string
  caption?: string
  isMainImage: boolean
  sortOrder?: number
  createdAt?: string
}

interface MediaUploadProps {
  projectId: string
  onUploadComplete: (media: UploadedMedia[]) => void
  existingMedia?: UploadedMedia[]
  maxFiles?: number
  acceptedFileTypes?: {
    'image/*': string[]
    'video/*': string[]
  }
}

export default function MediaUpload({
  projectId,
  onUploadComplete,
  existingMedia = [],
  maxFiles = 20,
  acceptedFileTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  }
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map((file) => {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: isImage ? URL.createObjectURL(file) : '',
        type: isVideo ? 'video' : 'image',
        status: 'pending',
        progress: 0,
        alt: '',
        caption: '',
        isMainImage: existingMedia.length === 0 && files.length === 0 // First image is main by default
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [existingMedia.length, files.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - existingMedia.length - files.length,
    maxSize: 100 * 1024 * 1024, // 100MB max file size
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: (rejectedFiles) => {
      setDragActive(false)
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`File "${file.name}" is too large. Max size is 100MB.`)
              break
            case 'file-invalid-type':
              toast.error(`File "${file.name}" has an invalid type.`)
              break
            case 'too-many-files':
              toast.error(`Too many files. Maximum ${maxFiles} files allowed.`)
              break
            default:
              toast.error(`Error with file "${file.name}": ${error.message}`)
          }
        })
      })
    }
  })

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }, [])

  const updateFileMetadata = useCallback((fileId: string, updates: Partial<MediaFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ))
  }, [])

  const setMainImage = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => ({
      ...file,
      isMainImage: file.id === fileId
    })))
  }, [])

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to upload')
      return
    }

    setIsUploading(true)
    const uploadResults = []

    try {
      for (const mediaFile of files) {
        updateFileMetadata(mediaFile.id, { status: 'uploading', progress: 0 })

        const formData = new FormData()
        formData.append('files', mediaFile.file)
        if (mediaFile.alt) formData.append('alt', mediaFile.alt)
        if (mediaFile.caption) formData.append('caption', mediaFile.caption)
        formData.append('isMainImage', mediaFile.isMainImage ? 'true' : 'false')

        try {
          const response = await fetch(`/api/admin/projects/${projectId}/media`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          }

          const result = await response.json()
          updateFileMetadata(mediaFile.id, { status: 'success', progress: 100 })
          uploadResults.push(...result.media)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          updateFileMetadata(mediaFile.id, { 
            status: 'error', 
            progress: 0, 
            error: errorMessage 
          })
          toast.error(`Failed to upload ${mediaFile.file.name}: ${errorMessage}`)
        }
      }

      if (uploadResults.length > 0) {
        toast.success(`Successfully uploaded ${uploadResults.length} file(s)`)
        onUploadComplete(uploadResults)
        
        // Clear successful uploads after a delay
        setTimeout(() => {
          setFiles(prev => prev.filter(file => file.status !== 'success'))
        }, 2000)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  const canUploadMore = existingMedia.length + files.length < maxFiles

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive || dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className={`w-12 h-12 transition-colors ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse to upload
                </button>
              </p>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Supports: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, MOV, AVI)</p>
              <p>Max file size: 100MB • Max {maxFiles} files total</p>
              <p>{existingMedia.length + files.length} / {maxFiles} files</p>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ready to Upload ({files.length})
            </h3>
            <div className="space-x-2">
              <button
                onClick={clearAll}
                disabled={isUploading}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                onClick={uploadFiles}
                disabled={isUploading || files.every(f => f.status === 'success')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((mediaFile) => (
              <FilePreview
                key={mediaFile.id}
                mediaFile={mediaFile}
                onRemove={removeFile}
                onUpdate={updateFileMetadata}
                onSetMain={setMainImage}
                disabled={isUploading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FilePreviewProps {
  mediaFile: MediaFile
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<MediaFile>) => void
  onSetMain: (id: string) => void
  disabled: boolean
}

function FilePreview({ mediaFile, onRemove, onUpdate, onSetMain, disabled }: FilePreviewProps) {
  const { id, file, preview, type, status, progress, alt, caption, isMainImage, error } = mediaFile

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Preview & Status */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {type === 'image' && preview ? (
            <Image
              src={preview}
              alt={file.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                {type === 'video' ? (
                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                ) : (
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                )}
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <button
                onClick={() => onRemove(id)}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {type}
          </p>
          
          {status === 'uploading' && (
            <div className="mt-2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${isNaN(progress) || progress < 0 ? 0 : Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>

      {/* Metadata */}
      {status === 'pending' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`main-${id}`}
              checked={isMainImage}
              onChange={() => onSetMain(id)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`main-${id}`} className="text-sm text-gray-700 dark:text-gray-300">
              Main image
            </label>
          </div>
          
          <input
            type="text"
            placeholder="Alt text (optional)"
            value={alt || ''}
            onChange={(e) => onUpdate(id, { alt: e.target.value })}
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption || ''}
            onChange={(e) => onUpdate(id, { caption: e.target.value })}
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
      )}
    </div>
  )
}