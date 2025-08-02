'use client'

import { useState } from 'react'
import { 
  History, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  Zap,
  Camera,
  RotateCcw as RevertIcon
} from 'lucide-react'

interface HistoryEntry {
  id: string
  state: any
  timestamp: number
  action: string
  description: string
  isCurrent?: boolean
  canRevert?: boolean
}

interface HistoryPanelProps {
  history: HistoryEntry[]
  currentIndex: number
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onJumpToEntry: (index: number) => void
  onClearHistory: () => void
  originalImageUrl?: string | null
  onRevertToOriginal?: () => void
  className?: string
}

export default function HistoryPanel({
  history,
  currentIndex,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onJumpToEntry,
  onClearHistory,
  originalImageUrl,
  onRevertToOriginal,
  className = ''
}: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'initialize':
        return '🎬'
      case 'brightness':
        return '☀️'
      case 'contrast':
        return '🔳'
      case 'saturation':
        return '🌈'
      case 'hue':
        return '🎨'
      case 'rotation':
        return '🔄'
      case 'crop':
        return '✂️'
      case 'scale':
        return '🔍'
      case 'flip':
        return '🔃'
      case 'reset':
        return '↺'
      case 'ai_enhance':
        return '✨'
      default:
        return '⚡'
    }
  }

  return (
    <div className={`bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-white/20">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-white hover:text-blue-400 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Edit History</span>
            <span className="text-xs text-white/50">
              ({history.length} {history.length === 1 ? 'step' : 'steps'})
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              canUndo
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              canRedo
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}
          >
            <RotateCw className="w-3 h-3" />
            <span>Redo</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={history.length <= 1}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              history.length > 1
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Clear all history"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Original Image Section */}
      {originalImageUrl && (
        <div className="p-3 border-b border-white/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-200">Original Image Available</span>
            </div>
            <button
              onClick={onRevertToOriginal}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-500/30 rounded text-xs font-medium text-amber-200 transition-colors touch-manipulation"
              title="Revert to original image (this will discard all edits)"
            >
              <RevertIcon className="w-3 h-3" />
              <span>Revert to Original</span>
            </button>
          </div>
          <div className="text-xs text-amber-300/70 mt-1">
            📷 This image has been previously edited. You can revert to the original version.
          </div>
        </div>
      )}

      {/* History List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          <div className="p-2 space-y-1">
            {history.slice().reverse().map((entry, reverseIndex) => {
              const actualIndex = history.length - 1 - reverseIndex
              const isCurrent = actualIndex === currentIndex
              const isFuture = actualIndex > currentIndex
              
              return (
                <button
                  key={entry.id}
                  onClick={() => onJumpToEntry(actualIndex)}
                  className={`w-full p-2 rounded text-left transition-all group ${
                    isCurrent
                      ? 'bg-blue-500/30 border border-blue-500/50'
                      : isFuture
                      ? 'bg-white/5 opacity-50 hover:opacity-70'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-sm">{getActionIcon(entry.action)}</span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-medium truncate ${
                          isCurrent ? 'text-blue-200' : 'text-white'
                        }`}>
                          {entry.description}
                        </div>
                        <div className="text-xs text-white/50 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <div className="flex items-center space-x-1 text-blue-400">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs">Current</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      {isExpanded && (
        <div className="p-3 border-t border-white/20">
          <div className="text-xs text-white/50 space-y-1">
            <div>💡 <strong>Keyboard shortcuts:</strong></div>
            <div>• Ctrl+Z: Undo</div>
            <div>• Ctrl+Y: Redo</div>
            <div>• Ctrl+Shift+H: Toggle history</div>
          </div>
        </div>
      )}
    </div>
  )
}