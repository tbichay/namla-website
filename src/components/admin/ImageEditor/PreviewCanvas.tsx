'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ZoomIn, ZoomOut, Maximize2, Move, RotateCcw, RotateCw, Eye, EyeOff, ArrowLeftRight, Sparkles } from 'lucide-react'

interface EditorState {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  exposure: number
  highlights: number
  shadows: number
  rotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  scale: number
  cropArea: {
    x: number
    y: number
    width: number
    height: number
  } | null
  showBeforeAfter: boolean
  zoom: number
}

interface PreviewCanvasProps {
  imageUrl: string
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
  imageMetadata: { width: number; height: number } | null
  enhancedImageUrl?: string // URL of enhanced/AI-processed image
  showEnhanced?: boolean // Whether to show enhanced version
  onToggleEnhanced?: (show: boolean) => void // Callback to toggle enhanced view
}

export default function PreviewCanvas({
  imageUrl,
  editorState,
  onStateUpdate,
  imageMetadata,
  enhancedImageUrl,
  showEnhanced = false,
  onToggleEnhanced
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Determine which image to display
  const displayImageUrl = showEnhanced && enhancedImageUrl ? enhancedImageUrl : imageUrl
  const shouldApplyFilters = !showEnhanced || !enhancedImageUrl // Only apply CSS filters to original images
  const hasEnhancedImage = Boolean(enhancedImageUrl)

  // Generate CSS filter string from editor state
  const generateFilters = useCallback(() => {
    const filters = []
    
    if (editorState.brightness !== 0) {
      filters.push(`brightness(${1 + editorState.brightness / 100})`)
    }
    if (editorState.contrast !== 0) {
      filters.push(`contrast(${1 + editorState.contrast / 100})`)
    }
    if (editorState.saturation !== 0) {
      filters.push(`saturate(${1 + editorState.saturation / 100})`)
    }
    if (editorState.hue !== 0) {
      filters.push(`hue-rotate(${editorState.hue}deg)`)
    }
    
    return filters.join(' ')
  }, [editorState])

  // Generate transform string
  const generateTransform = useCallback(() => {
    const transforms = []
    
    if (editorState.rotation !== 0) {
      transforms.push(`rotate(${editorState.rotation}deg)`)
    }
    if (editorState.flipHorizontal) {
      transforms.push('scaleX(-1)')
    }
    if (editorState.flipVertical) {
      transforms.push('scaleY(-1)')
    }
    if (editorState.scale !== 1) {
      transforms.push(`scale(${editorState.scale})`)
    }
    
    transforms.push(`scale(${editorState.zoom})`)
    transforms.push(`translate(${panOffset.x}px, ${panOffset.y}px)`)
    
    return transforms.join(' ')
  }, [editorState, panOffset])

  // Zoom controls
  const handleZoomIn = () => {
    onStateUpdate({ zoom: Math.min(editorState.zoom * 1.2, 5) })
  }

  const handleZoomOut = () => {
    onStateUpdate({ zoom: Math.max(editorState.zoom / 1.2, 0.1) })
  }

  const handleZoomFit = () => {
    onStateUpdate({ zoom: 1 })
    setPanOffset({ x: 0, y: 0 })
  }

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Rotation controls
  const handleRotateLeft = () => {
    onStateUpdate({ rotation: (editorState.rotation - 90) % 360 })
  }

  const handleRotateRight = () => {
    onStateUpdate({ rotation: (editorState.rotation + 90) % 360 })
  }

  // Keyboard shortcuts for zoom and pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault()
            handleZoomIn()
            break
          case '-':
            e.preventDefault()
            handleZoomOut()
            break
          case '0':
            e.preventDefault()
            handleZoomFit()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editorState.zoom])

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      onStateUpdate({ zoom: Math.max(0.1, Math.min(5, editorState.zoom * delta)) })
    }
  }

  return (
    <div className="relative w-full h-full bg-black/10 overflow-hidden">
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={`w-full h-full flex items-center justify-center relative ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Before/After Split View */}
        {editorState.showBeforeAfter ? (
          <div className="relative max-w-full max-h-full">
            <div className="flex shadow-2xl">
              {/* Before */}
              <div className="relative overflow-hidden" style={{ width: '50%' }}>
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt="Original"
                    width={imageMetadata?.width || 800}
                    height={imageMetadata?.height || 600}
                    className="object-contain"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      transform: `scale(${editorState.zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`
                    }}
                    onLoadingComplete={() => setIsLoading(false)}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Before
                  </div>
                </div>
              </div>
              
              {/* After */}
              <div className="relative overflow-hidden" style={{ width: '50%' }}>
                <div className="relative">
                  <Image
                    src={displayImageUrl}
                    alt="Edited"
                    width={imageMetadata?.width || 800}
                    height={imageMetadata?.height || 600}
                    className="object-contain"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      filter: shouldApplyFilters ? generateFilters() : 'none',
                      transform: generateTransform()
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    After
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider Line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/50 transform -translate-x-0.5" />
          </div>
        ) : (
          /* Regular Preview */
          <div className="relative max-w-full max-h-full">
            <Image
              src={displayImageUrl}
              alt="Preview"
              width={imageMetadata?.width || 800}
              height={imageMetadata?.height || 600}
              className="object-contain shadow-2xl"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                filter: shouldApplyFilters ? generateFilters() : 'none',
                transform: generateTransform(),
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              onLoadingComplete={() => setIsLoading(false)}
            />
            
            {/* Crop Overlay */}
            {editorState.cropArea && (
              <div
                className="absolute border-2 border-white/80 bg-black/20"
                style={{
                  left: `${editorState.cropArea.x}px`,
                  top: `${editorState.cropArea.y}px`,
                  width: `${editorState.cropArea.width}px`,
                  height: `${editorState.cropArea.height}px`,
                  transform: generateTransform()
                }}
              >
                <div className="absolute inset-0 border border-white/40" />
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-lg p-2">
        <button
          onClick={handleZoomOut}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-white text-sm min-w-[4rem] text-center">
          {Math.round(editorState.zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleZoomFit}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Fit to View (0)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Enhanced Image Toggle Controls */}
      {hasEnhancedImage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => onToggleEnhanced?.(false)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              !showEnhanced
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10'
            }`}
            title="Show Original"
          >
            <Eye className="w-4 h-4 mr-1 inline" />
            Original
          </button>
          
          <button
            onClick={() => onToggleEnhanced?.(true)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              showEnhanced
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:bg-white/10'
            }`}
            title="Show Enhanced"
          >
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Enhanced
          </button>
          
          <button
            onClick={() => onStateUpdate({ showBeforeAfter: !editorState.showBeforeAfter })}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              editorState.showBeforeAfter
                ? 'bg-purple-500 text-white'
                : 'text-white/70 hover:bg-white/10'
            }`}
            title="Compare Side by Side"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1 inline" />
            Compare
          </button>
        </div>
      )}

      {/* Quick Transform Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-lg p-2">
        <button
          onClick={handleRotateLeft}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Rotate Left"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleRotateRight}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Rotate Right"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Pan Hint */}
      {editorState.zoom > 1 && !isDragging && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
          <Move className="w-3 h-3 inline mr-1" />
          Click and drag to pan
        </div>
      )}

      {/* Image Info */}
      {imageMetadata && (
        <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg">
          {imageMetadata.width} × {imageMetadata.height}
        </div>
      )}
    </div>
  )
}