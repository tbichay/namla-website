'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { X, Video, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react'

interface VideoCompressionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  mediaId: string
  mediaUrl: string
  mediaName: string
  onCompressionComplete?: () => void
}

interface CompressionResult {
  success: boolean
  compression: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    quality: string
  }
  files: {
    compressed: string
    thumbnail: string | null
    original: string
  }
  urls: {
    compressed: string
    thumbnail: string | null
    original: string
  }
  metadata?: any
}

interface CompressionVersion {
  quality: string
  size: number
  url: string
  metadata: any
  lastModified: string
}

export default function VideoCompressionModal({
  isOpen,
  onClose,
  projectId,
  mediaId,
  mediaUrl,
  mediaName,
  onCompressionComplete
}: VideoCompressionModalProps) {
  const [isCompressing, setIsCompressing] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null)
  const [existingVersions, setExistingVersions] = useState<CompressionVersion[]>([])
  const [loading, setLoading] = useState(false)

  const qualityOptions = [
    {
      id: 'low' as const,
      name: 'Low Quality',
      description: 'Smallest file size, suitable for previews',
      icon: '📱',
      expectedReduction: '70-80%'
    },
    {
      id: 'medium' as const,
      name: 'Medium Quality',
      description: 'Balanced quality and file size',
      icon: '💻',
      expectedReduction: '50-60%'
    },
    {
      id: 'high' as const,
      name: 'High Quality',
      description: 'Best quality, moderate compression',
      icon: '🖥️',
      expectedReduction: '30-40%'
    }
  ]

  // Load existing compression versions
  useEffect(() => {
    if (isOpen) {
      loadExistingVersions()
    }
  }, [isOpen, projectId, mediaId])

  const loadExistingVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/compress`)
      
      if (response.ok) {
        const data = await response.json()
        setExistingVersions(data.versions || [])
      }
    } catch (error) {
      console.error('Error loading existing versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompress = async () => {
    try {
      setIsCompressing(true)
      setCompressionResult(null)

      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quality: selectedQuality,
          generateThumbnail: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCompressionResult(result)
        toast.success(`Video compressed successfully! ${result.compression.compressionRatio}% size reduction`)
        onCompressionComplete?.()
        await loadExistingVersions() // Refresh versions list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Compression failed')
      }
    } catch (error) {
      console.error('Compression error:', error)
      toast.error('Compression failed')
    } finally {
      setIsCompressing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Video Compression
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mediaName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isCompressing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Original Video Preview */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Original Video</h3>
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-48 rounded"
              preload="metadata"
            />
          </div>

          {/* Quality Selection */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Compression Quality</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {qualityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedQuality(option.id)}
                  disabled={isCompressing}
                  className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                    selectedQuality === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ~{option.expectedReduction} reduction
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Versions */}
          {existingVersions.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Existing Compressed Versions</h3>
              <div className="space-y-2">
                {existingVersions.map((version) => (
                  <div key={version.quality} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {version.quality} Quality
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(version.size)}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDownload(version.url, `${mediaName}-${version.quality}.mp4`)}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compression Result */}
          {compressionResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800 dark:text-green-200">Compression Complete!</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Original Size</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatFileSize(compressionResult.compression.originalSize)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Compressed Size</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatFileSize(compressionResult.compression.compressedSize)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Quality</div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {compressionResult.compression.quality}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Size Reduction</div>
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {compressionResult.compression.compressionRatio}%
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => handleDownload(compressionResult.urls.compressed, `${mediaName}-compressed.mp4`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed</span>
                </button>
                
                {compressionResult.urls.thumbnail && (
                  <button
                    onClick={() => handleDownload(compressionResult.urls.thumbnail!, `${mediaName}-thumbnail.jpg`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Thumbnail</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isCompressing}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {isCompressing ? 'Compressing...' : 'Close'}
            </button>
            
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Compress Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}