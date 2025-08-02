'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Undo2,
  Redo2,
  Eye,
  Settings,
  Sparkles,
  Palette,
  Layers,
  Save,
  RefreshCw,
  History
} from 'lucide-react'
import '@/styles/image-editor.css'
import PreviewCanvas from './ImageEditor/PreviewCanvas'
import EditingTabs from './ImageEditor/EditingTabs'
import HistoryPanel from './ImageEditor/HistoryPanel'
import { useEditHistory } from '@/lib/hooks/useEditHistory'

interface ImageEditorModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  mediaId: string
  mediaUrl: string
  mediaInfo?: {
    id: string
    filename: string
    originalName: string
    originalUrl?: string
  }
  onSaveComplete?: (result: any) => void
}

interface EditorState {
  // Basic adjustments
  brightness: number
  contrast: number
  saturation: number
  hue: number
  exposure: number
  highlights: number
  shadows: number
  
  // Transform
  rotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  scale: number
  
  // Crop
  cropArea: {
    x: number
    y: number
    width: number
    height: number
  } | null
  
  // UI state
  activeTab: 'basic' | 'ai' | 'style' | 'advanced'
  showBeforeAfter: boolean
  zoom: number
  isProcessing: boolean
}

const initialState: EditorState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  scale: 1,
  cropArea: null,
  activeTab: 'basic',
  showBeforeAfter: false,
  zoom: 1,
  isProcessing: false
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  projectId,
  mediaId,
  mediaUrl,
  mediaInfo,
  onSaveComplete
}: ImageEditorModalProps) {
  const [imageMetadata, setImageMetadata] = useState<{width: number, height: number} | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  // Disable original image detection for now to prevent any potential issues
  const [originalImageUrl] = useState<string | null>(null)
  // Enhanced image state
  const [currentEnhancedImageUrl, setCurrentEnhancedImageUrl] = useState<string | null>(null)
  const [showEnhanced, setShowEnhanced] = useState(false)
  
  // History management - only track the actual editing values, not UI state
  const historyState = {
    brightness: initialState.brightness,
    contrast: initialState.contrast,
    saturation: initialState.saturation,
    hue: initialState.hue,
    exposure: initialState.exposure,
    highlights: initialState.highlights,
    shadows: initialState.shadows,
    rotation: initialState.rotation,
    flipHorizontal: initialState.flipHorizontal,
    flipVertical: initialState.flipVertical,
    scale: initialState.scale,
    cropArea: initialState.cropArea
  }
  
  const {
    currentState,
    history,
    currentIndex,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    jumpToEntry,
    clearHistory,
    getHistorySummary,
    isUpdatingFromHistory
  } = useEditHistory({
    initialState: historyState,
    maxHistorySize: 50
  })
  
  // UI-only state that doesn't need history tracking
  const [uiState, setUiState] = useState({
    activeTab: initialState.activeTab,
    showBeforeAfter: initialState.showBeforeAfter,
    zoom: initialState.zoom,
    isProcessing: initialState.isProcessing
  })
  
  // Combine history state with UI state for components
  const editorState = { ...currentState, ...uiState }
  
  // Load image metadata when modal opens
  useEffect(() => {
    if (isOpen && mediaUrl) {
      const img = new window.Image()
      img.onload = () => {
        setImageMetadata({ width: img.width, height: img.height })
      }
      img.src = mediaUrl
    }
  }, [isOpen, mediaUrl])

  // Update editor state and track changes
  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    // Separate updates into history-tracked and UI-only updates
    const historyUpdates: any = {}
    const uiUpdates: any = {}
    
    Object.entries(updates).forEach(([key, value]) => {
      if (['activeTab', 'showBeforeAfter', 'zoom', 'isProcessing'].includes(key)) {
        uiUpdates[key] = value
      } else {
        historyUpdates[key] = value
      }
    })
    
    // Update UI state
    if (Object.keys(uiUpdates).length > 0) {
      setUiState(prev => ({ ...prev, ...uiUpdates }))
    }
    
    // Add to history if we have history-tracked changes and not updating from history
    if (Object.keys(historyUpdates).length > 0) {
      if (!isUpdatingFromHistory) {
        const newHistoryState = { ...currentState, ...historyUpdates }
        
        // Determine action type and description for history
        let action = 'edit'
        let description = 'Edit'
        
        if (historyUpdates.brightness !== undefined) {
          action = 'brightness'
          description = `Brightness: ${historyUpdates.brightness > 0 ? '+' : ''}${historyUpdates.brightness}`
        } else if (historyUpdates.contrast !== undefined) {
          action = 'contrast'
          description = `Contrast: ${historyUpdates.contrast > 0 ? '+' : ''}${historyUpdates.contrast}`
        } else if (historyUpdates.saturation !== undefined) {
          action = 'saturation'
          description = `Saturation: ${historyUpdates.saturation > 0 ? '+' : ''}${historyUpdates.saturation}`
        } else if (historyUpdates.hue !== undefined) {
          action = 'hue'
          description = `Hue: ${historyUpdates.hue > 0 ? '+' : ''}${historyUpdates.hue}°`
        } else if (historyUpdates.rotation !== undefined) {
          action = 'rotation'
          description = `Rotate: ${historyUpdates.rotation}°`
        } else if (historyUpdates.flipHorizontal !== undefined || historyUpdates.flipVertical !== undefined) {
          action = 'flip'
          description = 'Flip image'
        } else if (historyUpdates.cropArea !== undefined) {
          action = 'crop'
          description = historyUpdates.cropArea ? 'Apply crop' : 'Remove crop'
        } else if (historyUpdates.scale !== undefined) {
          action = 'scale'
          description = `Scale: ${Math.round(historyUpdates.scale * 100)}%`
        }
        
        addToHistory(newHistoryState, action, description)
        setHasUnsavedChanges(true)
      }
    }
  }, [currentState, isUpdatingFromHistory, addToHistory])

  // Reset editor state
  const resetEditor = useCallback(() => {
    clearHistory()
    setUiState({
      activeTab: initialState.activeTab,
      showBeforeAfter: initialState.showBeforeAfter,
      zoom: initialState.zoom,
      isProcessing: initialState.isProcessing
    })
    setHasUnsavedChanges(false)
  }, [clearHistory])

  // Revert to original image (disabled for now)
  const revertToOriginal = useCallback(async () => {
    toast.error('Revert to original feature is temporarily disabled')
  }, [])

  // Handle save
  const handleSave = async () => {
    try {
      updateEditorState({ isProcessing: true })
      
      // Prepare edit operations based on current state
      const operations = []
      
      // Add color adjustments if any
      const hasColorAdjustments = 
        editorState.brightness !== 0 ||
        editorState.contrast !== 0 ||
        editorState.saturation !== 0 ||
        editorState.hue !== 0 ||
        editorState.exposure !== 0 ||
        editorState.highlights !== 0 ||
        editorState.shadows !== 0 ||
        editorState.flipHorizontal ||
        editorState.flipVertical
        
      if (hasColorAdjustments) {
        operations.push({
          type: 'adjust',
          options: {
            brightness: editorState.brightness,
            contrast: editorState.contrast,
            saturation: editorState.saturation,
            hue: editorState.hue,
            exposure: editorState.exposure,
            highlights: editorState.highlights,
            shadows: editorState.shadows,
            flipHorizontal: editorState.flipHorizontal,
            flipVertical: editorState.flipVertical
          }
        })
      }
      
      // Add rotation if any
      if (editorState.rotation !== 0) {
        operations.push({
          type: 'rotate',
          options: { angle: editorState.rotation }
        })
      }
      
      // Add crop if any
      if (editorState.cropArea) {
        operations.push({
          type: 'crop',
          options: editorState.cropArea
        })
      }
      
      // Add resize if scale changed
      if (editorState.scale !== 1 && imageMetadata) {
        operations.push({
          type: 'resize',
          options: {
            width: Math.round(imageMetadata.width * editorState.scale),
            height: Math.round(imageMetadata.height * editorState.scale),
            preserveAspectRatio: true
          }
        })
      }
      
      if (operations.length === 0) {
        toast('No changes to save', {
          icon: 'ℹ️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        return
      }
      
      // Send edit request
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multipleOperations: operations
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('Image saved successfully!')
        setHasUnsavedChanges(false)
        onSaveComplete?.(result)
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save image')
      }
      
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save image')
    } finally {
      updateEditorState({ isProcessing: false })
    }
  }

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        resetEditor()
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'h':
            if (e.shiftKey) {
              e.preventDefault()
              setShowHistoryPanel(!showHistoryPanel)
            }
            break
        }
      }
      
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasUnsavedChanges, undo, redo, showHistoryPanel])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm">
      {/* Header - Responsive */}
      <div className="h-14 sm:h-16 bg-white/10 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-white truncate">Image Editor</h1>
          {mediaInfo && (
            <span className="hidden sm:inline text-sm text-white/70 truncate">{mediaInfo.originalName}</span>
          )}
          {originalImageUrl && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full whitespace-nowrap">
              Edited
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full whitespace-nowrap">
              Unsaved
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* History Controls - Compact on mobile */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors touch-manipulation ${
              canUndo 
                ? 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors touch-manipulation ${
              canRedo 
                ? 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {/* Hide history panel on mobile */}
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`hidden sm:flex p-2 rounded-lg transition-colors touch-manipulation ${
              showHistoryPanel 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
            }`}
            title="Toggle History Panel"
          >
            <History className="w-5 h-5" />
          </button>
          
          {/* Quick Actions - Mobile optimized */}
          <button
            onClick={() => updateEditorState({ showBeforeAfter: !editorState.showBeforeAfter })}
            className={`hidden sm:flex p-2 rounded-lg transition-colors touch-manipulation ${
              editorState.showBeforeAfter 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
            }`}
            title="Toggle Before/After"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            onClick={resetEditor}
            className="hidden sm:flex p-2 bg-white/10 text-white hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-manipulation"
            title="Reset All Changes"
            disabled={!hasUnsavedChanges}
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || editorState.isProcessing}
            className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation min-h-[44px]"
          >
            {editorState.isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm sm:text-base">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="text-sm sm:text-base">Save</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleClose}
            className="p-2 bg-white/10 text-white hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
        {/* Preview Panel - Mobile: Top, Desktop: Left 60% */}
        <div className="flex-1 lg:w-[60%] border-b lg:border-b-0 lg:border-r border-white/20 bg-black/20 min-h-[40vh] lg:min-h-0">
          <PreviewCanvas
            imageUrl={mediaUrl}
            editorState={editorState}
            onStateUpdate={updateEditorState}
            imageMetadata={imageMetadata}
            enhancedImageUrl={currentEnhancedImageUrl}
            showEnhanced={showEnhanced}
            onToggleEnhanced={setShowEnhanced}
          />
        </div>

        {/* Controls Panel - Mobile: Bottom, Desktop: Right 40% */}
        <div className="flex-1 lg:w-[40%] bg-white/5 backdrop-blur-sm flex flex-col max-h-[60vh] lg:max-h-none">
          {/* History Panel - Hidden on mobile */}
          {showHistoryPanel && (
            <div className="hidden sm:block border-b border-white/20">
              <HistoryPanel
                history={getHistorySummary()}
                currentIndex={currentIndex}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onJumpToEntry={jumpToEntry}
                onClearHistory={clearHistory}
                originalImageUrl={originalImageUrl}
                onRevertToOriginal={revertToOriginal}
                className="m-3"
              />
            </div>
          )}
          
          {/* Editing Tabs */}
          <div className="flex-1 min-h-0">
            <EditingTabs
              editorState={editorState}
              onStateUpdate={updateEditorState}
              projectId={projectId}
              mediaId={mediaId}
              mediaUrl={mediaUrl}
              onEnhancementResult={(enhancedUrl: string) => {
                setCurrentEnhancedImageUrl(enhancedUrl)
                setShowEnhanced(true)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}