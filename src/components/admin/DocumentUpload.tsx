'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { FileText, File, FileSpreadsheet, Presentation, Trash2, Loader2 } from 'lucide-react'

interface DocumentFile {
  id: string
  file: File
  type: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  displayName: string
  description: string
  isDownloadable: boolean
  error?: string
}

interface UploadedDocument {
  id: string
  url: string
  filename: string
  originalName: string
  displayName: string
  description?: string
  fileType: string
  fileSize: number
  isDownloadable: boolean
  sortOrder?: number
  createdAt?: string
}

interface DocumentUploadProps {
  projectId: string
  onUploadComplete: (documents: UploadedDocument[]) => void
  existingDocuments?: UploadedDocument[]
  maxFiles?: number
  acceptedFileTypes?: {
    'application/pdf': string[]
    'application/msword': string[]
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string[]
    'application/vnd.ms-excel': string[]
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': string[]
    'text/plain': string[]
  }
}

export default function DocumentUpload({
  projectId,
  onUploadComplete,
  existingDocuments = [],
  maxFiles = 10,
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt']
  }
}: DocumentUploadProps) {
  const [files, setFiles] = useState<DocumentFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DocumentFile[] = acceptedFiles.map((file) => {
      const fileExtension = file.name.toLowerCase().split('.').pop() || ''
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileExtension,
        status: 'pending',
        progress: 0,
        displayName: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        isDownloadable: true
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - existingDocuments.length - files.length,
    maxSize: 50 * 1024 * 1024, // 50MB max file size
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: (rejectedFiles) => {
      setDragActive(false)
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`File "${file.name}" is too large. Max size is 50MB.`)
              break
            case 'file-invalid-type':
              toast.error(`File "${file.name}" has an invalid type. Only PDF, Word, Excel, and text files are allowed.`)
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
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const updateFileMetadata = useCallback((fileId: string, updates: Partial<DocumentFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ))
  }, [])

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to upload')
      return
    }

    setIsUploading(true)
    const uploadResults = []

    try {
      for (const docFile of files) {
        updateFileMetadata(docFile.id, { status: 'uploading', progress: 0 })

        const formData = new FormData()
        formData.append('files', docFile.file)
        formData.append('displayName', docFile.displayName)
        formData.append('description', docFile.description)
        formData.append('isDownloadable', docFile.isDownloadable.toString())

        try {
          const response = await fetch(`/api/admin/projects/${projectId}/documents`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          }

          const result = await response.json()
          updateFileMetadata(docFile.id, { status: 'success', progress: 100 })
          uploadResults.push(...result.documents)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          updateFileMetadata(docFile.id, { 
            status: 'error', 
            progress: 0, 
            error: errorMessage 
          })
          toast.error(`Failed to upload ${docFile.file.name}: ${errorMessage}`)
        }
      }

      if (uploadResults.length > 0) {
        toast.success(`Successfully uploaded ${uploadResults.length} document(s)`)
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
    setFiles([])
  }

  const canUploadMore = existingDocuments.length + files.length < maxFiles

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-600" />
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-8 h-8 text-orange-600" />
      default:
        return <File className="w-8 h-8 text-gray-600" />
    }
  }

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
              <FileText className={`w-12 h-12 transition-colors ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? 'Drop documents here' : 'Drag & drop documents here'}
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
              <p>Supports: PDF, Word, Excel, PowerPoint, Text files</p>
              <p>Max file size: 50MB • Max {maxFiles} files total</p>
              <p>{existingDocuments.length + files.length} / {maxFiles} files</p>
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
                {isUploading ? 'Uploading...' : 'Upload Documents'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((docFile) => (
              <DocumentPreview
                key={docFile.id}
                documentFile={docFile}
                onRemove={removeFile}
                onUpdate={updateFileMetadata}
                disabled={isUploading}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DocumentPreviewProps {
  documentFile: DocumentFile
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<DocumentFile>) => void
  disabled: boolean
  getFileIcon: (fileType: string) => JSX.Element
}

function DocumentPreview({ documentFile, onRemove, onUpdate, disabled, getFileIcon }: DocumentPreviewProps) {
  const { id, file, type, status, progress, displayName, description, isDownloadable, error } = documentFile

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
      {/* Header with file info and status */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getFileIcon(type)}
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
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {type.toUpperCase()}
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
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => onUpdate(id, { displayName: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="e.g., Baubeschreibung"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => onUpdate(id, { description: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Additional information about this document"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`downloadable-${id}`}
              checked={isDownloadable}
              onChange={(e) => onUpdate(id, { isDownloadable: e.target.checked })}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`downloadable-${id}`} className="text-sm text-gray-700 dark:text-gray-300">
              Make downloadable (show in public project view)
            </label>
          </div>
        </div>
      )}
    </div>
  )
}