'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { X, Sparkles, Clock, DollarSign, Zap, Image as ImageIcon, Loader2, Upload, Trash2, Bookmark, BookmarkCheck, Grid3X3 } from 'lucide-react'

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
  batchMode?: boolean
  selectedMediaIds?: string[]
  selectedMedia?: Array<{id: string, url: string, filename: string}>
}

export default function AIEnhanceModal({
  isOpen,
  onClose,
  projectId,
  mediaId,
  mediaUrl,
  onEnhancementComplete,
  batchMode = false,
  selectedMediaIds = [],
  selectedMedia = []
}: AIEnhanceModalProps) {
  const [presets, setPresets] = useState<EnhancementPreset[]>([])
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enhancementResult, setEnhancementResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('')
  const [showStyleTransfer, setShowStyleTransfer] = useState(false)
  const [savedStyles, setSavedStyles] = useState<Array<{id: string, name: string, url: string, thumbnail: string}>>([])
  const [showStyleLibrary, setShowStyleLibrary] = useState(false)
  
  // Smart suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState<{
    primary: string
    alternatives: string[]
    reasons: string[]
    confidence: number
    issues: string[]
  } | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false)
  
  // Style analysis state
  const [styleAnalysis, setStyleAnalysis] = useState<{
    colorPalette: string[]
    lightingStyle: string
    contrast: string
    saturation: string
    temperature: string
    quality: number
  } | null>(null)
  const [similarImages, setSimilarImages] = useState<Array<{
    id: string
    url: string
    similarity: number
    matchingAttributes: string[]
    recommendedForStyleTransfer: boolean
  }>>([])
  const [loadingStyleAnalysis, setLoadingStyleAnalysis] = useState(false)
  const [showStyleAnalysis, setShowStyleAnalysis] = useState(false)
  
  // Advanced enhancement state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [advancedEnhancing, setAdvancedEnhancing] = useState(false)
  const [selectedAdvancedType, setSelectedAdvancedType] = useState<'hdr' | 'sky_replacement' | 'virtual_staging' | null>(null)
  const [hdrOptions, setHdrOptions] = useState({
    strength: 0.7,
    toneMapping: 'balanced' as 'natural' | 'dramatic' | 'balanced',
    shadowLift: 0.3,
    highlightRecovery: 0.4
  })
  const [skyOptions, setSkyOptions] = useState({
    skyType: 'clear_blue' as 'clear_blue' | 'dramatic_clouds' | 'sunset' | 'partly_cloudy',
    blendStrength: 0.8,
    preserveReflections: true,
    adjustLighting: true
  })
  const [stagingOptions, setStagingOptions] = useState({
    roomType: 'living_room' as 'living_room' | 'bedroom' | 'kitchen' | 'dining_room' | 'office',
    style: 'modern' as 'modern' | 'traditional' | 'minimalist' | 'luxury' | 'cozy',
    furnishingLevel: 'moderate' as 'minimal' | 'moderate' | 'fully_furnished',
    colorScheme: 'neutral' as 'neutral' | 'warm' | 'cool' | 'bold'
  })
  
  // Basic image editing state
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [imageEditing, setImageEditing] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [resizeOptions, setResizeOptions] = useState({ width: 800, height: 600, preserveAspectRatio: true })
  const [rotateAngle, setRotateAngle] = useState(0)

  // Fetch available presets and smart suggestions when modal opens
  useEffect(() => {
    if (isOpen && mediaId) {
      fetchPresets()
      fetchSmartSuggestions()
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

      if (batchMode && selectedMediaIds.length > 0) {
        // Batch processing
        const batchResponse = await fetch(`/api/admin/projects/${projectId}/media/batch-enhance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mediaIds: selectedMediaIds,
            preset: selectedPreset,
            style_transfer: showStyleTransfer && referenceImage ? true : false,
            reference_image_url: referenceImageUrl || undefined,
          })
        })

        setProgress(100)

        if (batchResponse.ok) {
          const result = await batchResponse.json()
          onEnhancementComplete(result)
          toast.success(`Style applied to ${selectedMediaIds.length} images!`)
          onClose()
        } else {
          const error = await batchResponse.json()
          toast.error(error.error || 'Batch enhancement failed')
        }
      } else {
        // Single image processing
        const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/enhance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preset: selectedPreset,
            style_transfer: showStyleTransfer && referenceImage ? true : false,
            reference_image_url: referenceImageUrl || undefined,
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
      }
    } catch (error) {
      toast.error(batchMode ? 'Batch enhancement failed' : 'Enhancement failed')
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
    toast('Enhancement discarded', {
      icon: 'ℹ️',
    })
  }

  const handleReset = () => {
    setEnhancementResult(null)
    setShowPreview(false)
    setEnhancing(false)
    setProgress(0)
    setSelectedPreset('')
    setReferenceImage(null)
    setReferenceImageUrl('')
    setShowStyleTransfer(false)
  }

  const handleReferenceImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    try {
      // Show loading state
      const loadingToast = toast.loading('Uploading reference image...')
      
      // Upload to server
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/admin/upload-reference-image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const result = await response.json()
      
      // Set the server URL for processing
      setReferenceImage(file)
      setReferenceImageUrl(result.url) // Use server URL, not blob URL
      setShowStyleTransfer(true)
      
      toast.dismiss(loadingToast)
      toast.success('Reference image uploaded! Style transfer enabled.')
      
    } catch (error) {
      console.error('Reference image upload failed:', error)
      toast.error('Failed to upload reference image')
    }
  }

  const handleRemoveReferenceImage = () => {
    if (referenceImageUrl) {
      URL.revokeObjectURL(referenceImageUrl)
    }
    setReferenceImage(null)
    setReferenceImageUrl('')
    setShowStyleTransfer(false)
    toast('Reference image removed', { icon: 'ℹ️' })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleReferenceImageUpload(files[0])
    }
  }

  const saveCurrentStyle = () => {
    if (!referenceImage || !referenceImageUrl) {
      toast.error('No reference image to save')
      return
    }

    const styleName = prompt('Enter a name for this style:')
    if (!styleName) return

    const newStyle = {
      id: Date.now().toString(),
      name: styleName,
      url: referenceImageUrl,
      thumbnail: referenceImageUrl // In real implementation, this would be a smaller thumbnail
    }

    setSavedStyles(prev => [...prev, newStyle])
    
    // Save to localStorage for persistence (in real app, this would be saved to database)
    const existingStyles = JSON.parse(localStorage.getItem('savedStyles') || '[]')
    localStorage.setItem('savedStyles', JSON.stringify([...existingStyles, newStyle]))
    
    toast.success(`Style "${styleName}" saved to library!`)
  }

  const loadSavedStyles = () => {
    try {
      const styles = JSON.parse(localStorage.getItem('savedStyles') || '[]')
      setSavedStyles(styles)
    } catch (error) {
      console.error('Error loading saved styles:', error)
    }
  }

  // Smart suggestions functions
  const fetchSmartSuggestions = async () => {
    if (!mediaId || batchMode) return // Don't fetch for batch mode
    
    try {
      setLoadingSuggestions(true)
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/suggestions`)
      
      if (response.ok) {
        const data = await response.json()
        setSmartSuggestions(data.suggestions)
        setShowSmartSuggestions(true)
        
        // Auto-select primary suggestion if confidence is high
        if (data.suggestions.confidence > 0.8) {
          setSelectedPreset(data.suggestions.primary)
          toast.success(`Smart suggestion: ${data.suggestions.primary}`, {
            icon: '🧠'
          })
        }
      } else {
        console.error('Failed to fetch smart suggestions')
      }
    } catch (error) {
      console.error('Error fetching smart suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const applySuggestion = (preset: string) => {
    setSelectedPreset(preset)
    toast.success(`Applied suggestion: ${preset}`)
  }

  // Style analysis functions
  const analyzeImageStyle = async () => {
    if (!mediaUrl || batchMode) return
    
    try {
      setLoadingStyleAnalysis(true)
      
      // First analyze the current image
      const analysisResponse = await fetch(`/api/admin/projects/${projectId}/media/style-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetImageUrl: mediaUrl,
          mode: 'analyze'
        })
      })
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setStyleAnalysis(analysisData.analysis)
      }
      
      // Then find similar images
      const similarResponse = await fetch(`/api/admin/projects/${projectId}/media/style-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetImageUrl: mediaUrl,
          mode: 'find_similar'
        })
      })
      
      if (similarResponse.ok) {
        const similarData = await similarResponse.json()
        setSimilarImages(similarData.similarImages || [])
        setShowStyleAnalysis(true)
        
        if (similarData.recommendations?.styleTransferCandidates?.length > 0) {
          toast.success(`Found ${similarData.recommendations.styleTransferCandidates.length} images with similar style!`, {
            icon: '🎨'
          })
        }
      }
      
    } catch (error) {
      console.error('Style analysis failed:', error)
      toast.error('Failed to analyze image style')
    } finally {
      setLoadingStyleAnalysis(false)
    }
  }
  
  const useImageAsReference = (imageUrl: string) => {
    setReferenceImageUrl(imageUrl)
    setShowStyleTransfer(true)
    setShowStyleAnalysis(false)
    toast.success('Image set as style reference!')
  }

  // Advanced enhancement functions
  const processAdvancedEnhancement = async (type: 'hdr' | 'sky_replacement' | 'virtual_staging') => {
    if (!mediaId || batchMode) return
    
    try {
      setAdvancedEnhancing(true)
      setSelectedAdvancedType(type)
      
      const options = {
        enhancementType: type,
        hdrOptions: type === 'hdr' ? hdrOptions : undefined,
        skyOptions: type === 'sky_replacement' ? skyOptions : undefined,
        stagingOptions: type === 'virtual_staging' ? stagingOptions : undefined
      }
      
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/advanced-enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })
      
      if (response.ok) {
        const result = await response.json()
        onEnhancementComplete(result.enhancement)
        toast.success(`${type.replace('_', ' ')} enhancement completed!`, {
          icon: type === 'hdr' ? '🌟' : type === 'sky_replacement' ? '🌤️' : '🏠'
        })
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || `${type} enhancement failed`)
      }
      
    } catch (error) {
      console.error('Advanced enhancement failed:', error)
      toast.error(`Failed to process ${type} enhancement`)
    } finally {
      setAdvancedEnhancing(false)
      setSelectedAdvancedType(null)
    }
  }

  // Basic image editing functions
  const performImageEdit = async (operation: 'crop' | 'resize' | 'rotate', options: any) => {
    if (!mediaId || batchMode) return
    
    try {
      setImageEditing(true)
      
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, options })
      })
      
      if (response.ok) {
        const result = await response.json()
        onEnhancementComplete(result.result)
        toast.success(`Image ${operation} completed!`, {
          icon: operation === 'crop' ? '✂️' : operation === 'resize' ? '🔧' : '🔄'
        })
        setShowImageEditor(false)
      } else {
        const error = await response.json()
        toast.error(error.error || `Image ${operation} failed`)
      }
      
    } catch (error) {
      console.error('Image editing failed:', error)
      toast.error(`Failed to ${operation} image`)
    } finally {
      setImageEditing(false)
    }
  }

  const handleCrop = () => {
    performImageEdit('crop', cropArea)
  }

  const handleResize = () => {
    performImageEdit('resize', resizeOptions)
  }

  const handleRotate = (angle: number) => {
    setRotateAngle(angle)
    performImageEdit('rotate', { angle })
  }

  const selectSavedStyle = (style: any) => {
    setReferenceImageUrl(style.url)
    setShowStyleTransfer(true)
    setShowStyleLibrary(false)
    toast.success(`Applied style: ${style.name}`)
  }

  const deleteSavedStyle = (styleId: string) => {
    setSavedStyles(prev => prev.filter(s => s.id !== styleId))
    
    // Update localStorage
    const updatedStyles = savedStyles.filter(s => s.id !== styleId)
    localStorage.setItem('savedStyles', JSON.stringify(updatedStyles))
    
    toast('Style removed from library', { icon: 'ℹ️' })
  }

  // Load saved styles when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSavedStyles()
    }
  }, [isOpen])

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
                {batchMode ? 'Batch Style Application' : 'AI Image Enhancement'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {batchMode 
                  ? `Apply consistent styling to ${selectedMedia.length} selected images`
                  : 'Enhance your real estate photos with AI'
                }
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
            {/* API Status Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🤖</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Enhancement Ready</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Real AI processing with OpenAI DALL-E 3 and Replicate models. Enhanced images will be automatically saved to your project.
                  </p>
                </div>
              </div>
            </div>

            {/* Batch Mode: Selected Images Grid */}
            {batchMode && selectedMedia.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Images ({selectedMedia.length})
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {selectedMedia.map((item) => (
                    <div key={item.id} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  The selected style will be applied to all images above
                </p>
              </div>
            )}
            
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
                      <p><strong>Provider:</strong> {enhancementResult.enhancement?.provider || 'N/A'} <span className="text-green-600 font-medium">(Real AI Processing)</span></p>
                      <p><strong>Processing Time:</strong> {enhancementResult.enhancement?.processing_time || 0}ms</p>
                      <p><strong>Cost:</strong> ${enhancementResult.enhancement?.cost?.toFixed(3) || '0.000'}</p>
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

            {/* Smart Suggestions - Only show when not in preview mode and not batch mode */}
            {!showPreview && !batchMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    🧠 Smart Suggestions
                  </h3>
                  <button
                    onClick={fetchSmartSuggestions}
                    disabled={loadingSuggestions}
                    className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {loadingSuggestions ? '🔄 Analyzing...' : '↻ Refresh'}
                  </button>
                </div>

                {loadingSuggestions ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Analyzing image to generate smart suggestions...
                      </span>
                    </div>
                  </div>
                ) : smartSuggestions ? (
                  <div className="space-y-3">
                    {/* Primary Suggestion */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Recommended: {smartSuggestions.primary}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded">
                              {Math.round(smartSuggestions.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                            {smartSuggestions.reasons[0]}
                          </p>
                        </div>
                        <button
                          onClick={() => applySuggestion(smartSuggestions.primary)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Alternative Suggestions */}
                    {smartSuggestions.alternatives.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {smartSuggestions.alternatives.slice(0, 4).map((preset) => (
                          <button
                            key={preset}
                            onClick={() => applySuggestion(preset)}
                            className="p-2 text-left border border-gray-200 dark:border-gray-600 rounded hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {preset}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Issues Found */}
                    {smartSuggestions.issues.length > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                          Issues detected:
                        </span>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                          {smartSuggestions.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Click "Refresh" to analyze image and get smart suggestions
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Style Analysis & Matching - Only show when not in preview mode and not batch mode */}
            {!showPreview && !batchMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    🎨 Style Analysis & Matching
                  </h3>
                  <button
                    onClick={analyzeImageStyle}
                    disabled={loadingStyleAnalysis}
                    className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 transition-colors"
                  >
                    {loadingStyleAnalysis ? '🔄 Analyzing...' : 'Analyze Style'}
                  </button>
                </div>

                {loadingStyleAnalysis ? (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        Analyzing style characteristics and finding similar images...
                      </span>
                    </div>
                  </div>
                ) : showStyleAnalysis && styleAnalysis ? (
                  <div className="space-y-4">
                    {/* Style Characteristics */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Style Characteristics
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Temperature:</span>
                          <span className={`px-2 py-1 rounded ${
                            styleAnalysis.temperature === 'warm' ? 'bg-orange-100 text-orange-700' :
                            styleAnalysis.temperature === 'cool' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {styleAnalysis.temperature}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Lighting:</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            {styleAnalysis.lightingStyle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Contrast:</span>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            {styleAnalysis.contrast}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Saturation:</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            {styleAnalysis.saturation}
                          </span>
                        </div>
                      </div>
                      
                      {/* Color Palette */}
                      {styleAnalysis.colorPalette.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">Color Palette:</span>
                          <div className="flex space-x-1 mt-1">
                            {styleAnalysis.colorPalette.slice(0, 5).map((color, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Similar Images */}
                    {similarImages.length > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                          Similar Images Found ({similarImages.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {similarImages.slice(0, 6).map((image) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={image.url}
                                  alt="Similar image"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Similarity Badge */}
                              <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                {image.similarity}%
                              </div>
                              
                              {/* Recommended Badge */}
                              {image.recommendedForStyleTransfer && (
                                <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                                  ★
                                </div>
                              )}
                              
                              {/* Action Button */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <button
                                  onClick={() => useImageAsReference(image.url)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded"
                                >
                                  Use as Reference
                                </button>
                              </div>
                              
                              {/* Matching Attributes */}
                              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                {image.matchingAttributes.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {similarImages.length > 6 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                            + {similarImages.length - 6} more similar images found
                          </p>
                        )}
                      </div>
                    )}
                    
                    {similarImages.length === 0 && (
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No similar images found in this project
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click "Analyze Style" to find images with similar characteristics
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Enhancement Options - Only show when not in preview mode and not batch mode */}
            {!showPreview && !batchMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    🚀 Advanced Options
                  </h3>
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                  >
                    {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
                  </button>
                </div>

                {showAdvancedOptions && (
                  <div className="space-y-4">
                    {/* HDR Processing */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            🌟 HDR Processing
                          </h4>
                          <p className="text-xs text-yellow-600 dark:text-yellow-300">
                            Balance exposure and enhance dynamic range
                          </p>
                        </div>
                        <button
                          onClick={() => processAdvancedEnhancement('hdr')}
                          disabled={advancedEnhancing}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {advancedEnhancing && selectedAdvancedType === 'hdr' ? 'Processing...' : 'Apply HDR'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">Strength</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={hdrOptions.strength}
                            onChange={(e) => setHdrOptions({...hdrOptions, strength: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <span className="text-yellow-600">{hdrOptions.strength}</span>
                        </div>
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">Tone Mapping</label>
                          <select
                            value={hdrOptions.toneMapping}
                            onChange={(e) => setHdrOptions({...hdrOptions, toneMapping: e.target.value as any})}
                            className="w-full px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                          >
                            <option value="natural">Natural</option>
                            <option value="balanced">Balanced</option>
                            <option value="dramatic">Dramatic</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Sky Replacement */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            🌤️ Sky Replacement
                          </h4>
                          <p className="text-xs text-blue-600 dark:text-blue-300">
                            Replace sky for perfect weather conditions
                          </p>
                        </div>
                        <button
                          onClick={() => processAdvancedEnhancement('sky_replacement')}
                          disabled={advancedEnhancing}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {advancedEnhancing && selectedAdvancedType === 'sky_replacement' ? 'Processing...' : 'Replace Sky'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-blue-700 dark:text-blue-300 mb-1">Sky Type</label>
                          <select
                            value={skyOptions.skyType}
                            onChange={(e) => setSkyOptions({...skyOptions, skyType: e.target.value as any})}
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs"
                          >
                            <option value="clear_blue">Clear Blue</option>
                            <option value="dramatic_clouds">Dramatic Clouds</option>
                            <option value="sunset">Sunset</option>
                            <option value="partly_cloudy">Partly Cloudy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-blue-700 dark:text-blue-300 mb-1">Blend Strength</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={skyOptions.blendStrength}
                            onChange={(e) => setSkyOptions({...skyOptions, blendStrength: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <span className="text-blue-600">{skyOptions.blendStrength}</span>
                        </div>
                      </div>
                    </div>

                    {/* Virtual Staging */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            🏠 Virtual Staging
                          </h4>
                          <p className="text-xs text-purple-600 dark:text-purple-300">
                            Add furniture and decor to empty spaces
                          </p>
                        </div>
                        <button
                          onClick={() => processAdvancedEnhancement('virtual_staging')}
                          disabled={advancedEnhancing}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {advancedEnhancing && selectedAdvancedType === 'virtual_staging' ? 'Processing...' : 'Add Staging'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-purple-700 dark:text-purple-300 mb-1">Room Type</label>
                          <select
                            value={stagingOptions.roomType}
                            onChange={(e) => setStagingOptions({...stagingOptions, roomType: e.target.value as any})}
                            className="w-full px-2 py-1 bg-white border border-purple-300 rounded text-xs"
                          >
                            <option value="living_room">Living Room</option>
                            <option value="bedroom">Bedroom</option>
                            <option value="kitchen">Kitchen</option>
                            <option value="dining_room">Dining Room</option>
                            <option value="office">Office</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-purple-700 dark:text-purple-300 mb-1">Style</label>
                          <select
                            value={stagingOptions.style}
                            onChange={(e) => setStagingOptions({...stagingOptions, style: e.target.value as any})}
                            className="w-full px-2 py-1 bg-white border border-purple-300 rounded text-xs"
                          >
                            <option value="modern">Modern</option>
                            <option value="traditional">Traditional</option>
                            <option value="minimalist">Minimalist</option>
                            <option value="luxury">Luxury</option>
                            <option value="cozy">Cozy</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Basic Image Editing - Only show when not in preview mode and not batch mode */}
            {!showPreview && !batchMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    ✂️ Basic Image Editing
                  </h3>
                  <button
                    onClick={() => setShowImageEditor(!showImageEditor)}
                    className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    {showImageEditor ? 'Hide' : 'Show'} Editor
                  </button>
                </div>

                {showImageEditor && (
                  <div className="space-y-4">
                    {/* Quick Rotate */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                        🔄 Quick Rotate
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRotate(90)}
                          disabled={imageEditing}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {imageEditing && rotateAngle === 90 ? 'Rotating...' : '↻ 90°'}
                        </button>
                        <button
                          onClick={() => handleRotate(180)}
                          disabled={imageEditing}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {imageEditing && rotateAngle === 180 ? 'Rotating...' : '↻ 180°'}
                        </button>
                        <button
                          onClick={() => handleRotate(270)}
                          disabled={imageEditing}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {imageEditing && rotateAngle === 270 ? 'Rotating...' : '↻ 270°'}
                        </button>
                      </div>
                    </div>

                    {/* Resize */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          🔧 Resize Image
                        </h4>
                        <button
                          onClick={handleResize}
                          disabled={imageEditing}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {imageEditing ? 'Resizing...' : 'Apply Resize'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-blue-700 dark:text-blue-300 mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={resizeOptions.width}
                            onChange={(e) => setResizeOptions({...resizeOptions, width: parseInt(e.target.value) || 800})}
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs"
                            min="1"
                            max="4000"
                          />
                        </div>
                        <div>
                          <label className="block text-blue-700 dark:text-blue-300 mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={resizeOptions.height}
                            onChange={(e) => setResizeOptions({...resizeOptions, height: parseInt(e.target.value) || 600})}
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs"
                            min="1"
                            max="4000"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <label className="flex items-center text-xs text-blue-700 dark:text-blue-300">
                          <input
                            type="checkbox"
                            checked={resizeOptions.preserveAspectRatio}
                            onChange={(e) => setResizeOptions({...resizeOptions, preserveAspectRatio: e.target.checked})}
                            className="mr-1"
                          />
                          Preserve aspect ratio
                        </label>
                      </div>
                    </div>

                    {/* Crop */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          ✂️ Crop Image
                        </h4>
                        <button
                          onClick={handleCrop}
                          disabled={imageEditing}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                        >
                          {imageEditing ? 'Cropping...' : 'Apply Crop'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">X Position</label>
                          <input
                            type="number"
                            value={cropArea.x}
                            onChange={(e) => setCropArea({...cropArea, x: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">Y Position</label>
                          <input
                            type="number"
                            value={cropArea.y}
                            onChange={(e) => setCropArea({...cropArea, y: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">Width</label>
                          <input
                            type="number"
                            value={cropArea.width}
                            onChange={(e) => setCropArea({...cropArea, width: parseInt(e.target.value) || 100})}
                            className="w-full px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-yellow-700 dark:text-yellow-300 mb-1">Height</label>
                          <input
                            type="number"
                            value={cropArea.height}
                            onChange={(e) => setCropArea({...cropArea, height: parseInt(e.target.value) || 100})}
                            className="w-full px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        Position and size in pixels from top-left corner
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* Style Transfer Section - Blueprint Upload */}
            {!showPreview && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Style Transfer (Blueprint)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowStyleLibrary(!showStyleLibrary)}
                      className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <Grid3X3 className="w-3 h-3" />
                      <span>Library ({savedStyles.length})</span>
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Optional
                    </div>
                  </div>
                </div>
                
                {!referenceImage ? (
                  // Upload Area
                  <div
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('reference-upload')?.click()}
                  >
                    <input
                      id="reference-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleReferenceImageUpload(file)
                      }}
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Upload Reference Image
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Upload a "blueprint" image to transfer its style to your photo
                    </p>
                    <p className="text-xs text-gray-400">
                      Drag & drop or click to select • JPG, PNG up to 10MB
                    </p>
                  </div>
                ) : (
                  // Reference Image Preview
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Reference Style Image
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={saveCurrentStyle}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Save Style</span>
                        </button>
                        <button
                          onClick={handleRemoveReferenceImage}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                          <Image
                            src={referenceImageUrl}
                            alt="Reference style image"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                          Style Reference
                        </p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✨</span>
                            </div>
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                              Style Transfer Active
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            AI will apply the lighting, color grading, and mood from your reference image while preserving the original composition and structure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Style Library Grid */}
                {showStyleLibrary && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Saved Style Library
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {savedStyles.length} styles saved
                      </span>
                    </div>
                    
                    {savedStyles.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookmarkCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No saved styles yet</p>
                        <p className="text-xs mt-1">Upload a reference image and save it to build your style library</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {savedStyles.map((style) => (
                          <div key={style.id} className="group relative">
                            <div 
                              className="relative aspect-square bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              onClick={() => selectSavedStyle(style)}
                            >
                              <Image
                                src={style.thumbnail}
                                alt={style.name}
                                fill
                                sizes="150px"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSavedStyle(style.id)
                                  }}
                                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {style.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selected Preset Details - Only show when not in preview mode */}
            {!showPreview && selectedPresetData && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Enhancement Operations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {showStyleTransfer && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full font-medium">
                      ✨ Style Transfer
                    </span>
                  )}
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
                          <span>{batchMode ? 'Applying to All...' : 'Enhancing...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{batchMode ? `Apply to ${selectedMedia.length} Images` : 'Preview Enhancement'}</span>
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