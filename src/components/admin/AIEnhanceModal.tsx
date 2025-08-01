'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { X, Sparkles, Clock, DollarSign, Zap, Image as ImageIcon, Loader2 } from 'lucide-react'

interface EnhancementPreset {
  name: string
  displayName: string
  description: string
  provider: string
  operations: Record<string, boolean>
  estimatedCost: number
  processingTime: string
}

interface MediaInfo {
  id: string
  url: string
  mediaType: 'image' | 'video'
  filename: string
}

interface AIEnhanceModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  mediaId: string
  mediaUrl: string
  onEnhancementComplete: (result: any) => void
}

export default function AIEnhanceModal({
  isOpen,
  onClose,
  projectId,
  mediaId,
  mediaUrl,
  onEnhancementComplete
}: AIEnhanceModalProps) {
  const [presets, setPresets] = useState<EnhancementPreset[]>([])
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enhancementResult, setEnhancementResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch available presets when modal opens
  useEffect(() => {
    if (isOpen && mediaId) {
      fetchPresets()
    }
  }, [isOpen, mediaId])

  // Simulate progress during enhancement
  useEffect(() => {
    if (enhancing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [enhancing])

  const fetchPresets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/enhance`)
      if (response.ok) {
        const data = await response.json()
        setPresets(data.presets)
        setMediaInfo(data.mediaInfo)
        // Auto-select the first preset
        if (data.presets.length > 0) {
          setSelectedPreset(data.presets[0].name)
        }
      } else {
        toast.error('Failed to load enhancement options')
      }
    } catch (error) {
      toast.error('Error loading enhancement options')
      console.error('Error fetching presets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnhance = async () => {
    if (!selectedPreset) {
      toast.error('Please select an enhancement preset')
      return
    }

    try {
      setEnhancing(true)
      setProgress(10)

      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset: selectedPreset
        })
      })

      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        setEnhancementResult(result)
        setShowPreview(true)
        toast.success('Enhancement preview ready!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Enhancement failed')
      }
    } catch (error) {
      toast.error('Enhancement failed')
      console.error('Enhancement error:', error)
    } finally {
      setEnhancing(false)
      setProgress(0)
    }
  }

  const handleApplyEnhancement = async () => {
    try {
      // Apply the enhancement to the database
      onEnhancementComplete(enhancementResult)
      toast.success('Enhancement applied successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to apply enhancement')
    }
  }

  const handleRejectEnhancement = () => {
    setEnhancementResult(null)
    setShowPreview(false)
    toast.info('Enhancement discarded')
  }

  const handleReset = () => {
    setEnhancementResult(null)
    setShowPreview(false)
    setEnhancing(false)
    setProgress(0)
    setSelectedPreset('')
  }

  if (!isOpen) return null

  const selectedPresetData = presets.find(p => p.name === selectedPreset)

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Image Enhancement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enhance your real estate photos with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={enhancing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Loading enhancement options...</span>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Image Preview - Before/After or Selection */}
            <div className="mb-6">
              {showPreview && enhancementResult ? (
                // Before/After Comparison
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
                    Enhancement Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Image */}
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original</h4>
                      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={mediaUrl}
                          alt="Original image"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Enhanced Image */}
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enhanced</h4>
                      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={enhancementResult.enhancement?.enhanced_url || mediaUrl}
                          alt="Enhanced image"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Enhanced
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhancement Details */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-900 dark:text-blue-300">
                      <p><strong>Operations Applied:</strong> {enhancementResult.enhancement?.operations_applied?.join(', ') || 'N/A'}</p>
                      <p><strong>Provider:</strong> {enhancementResult.enhancement?.provider || 'N/A'}</p>
                      <p><strong>Processing Time:</strong> {enhancementResult.enhancement?.processing_time || 0}ms</p>
                      {enhancementResult.enhancement?.cost && (
                        <p><strong>Cost:</strong> ${enhancementResult.enhancement.cost.toFixed(3)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Original Image Selection
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Current Image
                  </h3>
                  <div className="relative w-full max-w-md mx-auto">
                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <Image
                        src={mediaUrl}
                        alt="Image to enhance"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                      />
                    </div>
                    {mediaInfo && (
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {mediaInfo.filename}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Enhancement Presets - Only show when not in preview mode */}
            {!showPreview && (<div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Enhancement Presets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((preset) => (
                  <div
                    key={preset.name}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPreset === preset.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedPreset(preset.name)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        preset.provider === 'autoenhance' ? 'bg-green-100 text-green-600' :
                        preset.provider === 'imagen' ? 'bg-purple-100 text-purple-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {preset.provider === 'deep-image' ? <Zap className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {preset.displayName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {preset.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-xs">
                          <div className="flex items-center space-x-1 text-green-600">
                            <DollarSign className="w-3 h-3" />
                            <span>${preset.estimatedCost.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Clock className="w-3 h-3" />
                            <span>{preset.processingTime}</span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {preset.provider}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedPreset === preset.name && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>)}

            {/* Selected Preset Details - Only show when not in preview mode */}
            {!showPreview && selectedPresetData && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Enhancement Operations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedPresetData.operations)
                    .filter(([, enabled]) => enabled)
                    .map(([operation]) => (
                      <span
                        key={operation}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                      >
                        {operation.replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Enhancement Progress */}
            {enhancing && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Enhancing image...
                  </span>
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    {Math.round(isNaN(progress) || progress < 0 ? 0 : Math.min(progress, 100))}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${isNaN(progress) || progress < 0 ? 0 : Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {!showPreview && selectedPresetData && (
                  <>
                    Estimated cost: <span className="font-medium">${selectedPresetData.estimatedCost.toFixed(2)}</span>
                    {' • '}
                    Processing time: <span className="font-medium">{selectedPresetData.processingTime}</span>
                  </>
                )}
                {showPreview && enhancementResult && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Enhancement ready to apply
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                {showPreview ? (
                  // Preview Mode Actions
                  <>
                    <button
                      onClick={handleRejectEnhancement}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleApplyEnhancement}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>Apply Enhancement</span>
                    </button>
                  </>
                ) : (
                  // Enhancement Mode Actions
                  <>
                    <button
                      onClick={onClose}
                      disabled={enhancing}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEnhance}
                      disabled={!selectedPreset || enhancing}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                    >
                      {enhancing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Preview Enhancement</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}