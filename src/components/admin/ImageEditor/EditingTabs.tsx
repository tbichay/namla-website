'use client'

import { useState } from 'react'
import { Settings, Sparkles, Palette, Layers, Eye } from 'lucide-react'
import BasicEditingTab from './BasicEditingTab'
import AIEnhancementTab from './AIEnhancementTab'
import StyleTransferTab from './StyleTransferTab'
import AdvancedTab from './AdvancedTab'

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
  activeTab: 'basic' | 'ai' | 'style' | 'advanced'
  showBeforeAfter: boolean
  zoom: number
  isProcessing: boolean
}

interface EditingTabsProps {
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
  projectId: string
  mediaId: string
  mediaUrl: string
  onEnhancementResult?: (enhancedUrl: string) => void
}

const tabs = [
  {
    id: 'basic' as const,
    name: 'Basic',
    icon: Settings,
    description: 'Brightness, contrast, crop, rotate'
  },
  {
    id: 'ai' as const,
    name: 'AI Enhancement',
    icon: Sparkles,
    description: 'AI-powered image improvements'
  },
  {
    id: 'style' as const,
    name: 'Style Transfer',
    icon: Palette,
    description: 'Apply artistic styles'
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    icon: Layers,
    description: 'HDR, sky replacement, staging'
  }
]

export default function EditingTabs({
  editorState,
  onStateUpdate,
  projectId,
  mediaId,
  mediaUrl,
  onEnhancementResult
}: EditingTabsProps) {
  const setActiveTab = (tab: EditorState['activeTab']) => {
    onStateUpdate({ activeTab: tab })
  }

  const renderTabContent = () => {
    switch (editorState.activeTab) {
      case 'basic':
        return (
          <BasicEditingTab
            editorState={editorState}
            onStateUpdate={onStateUpdate}
          />
        )
      case 'ai':
        return (
          <AIEnhancementTab
            editorState={editorState}
            onStateUpdate={onStateUpdate}
            projectId={projectId}
            mediaId={mediaId}
            mediaUrl={mediaUrl}
            onEnhancementResult={onEnhancementResult}
          />
        )
      case 'style':
        return (
          <StyleTransferTab
            editorState={editorState}
            onStateUpdate={onStateUpdate}
            projectId={projectId}
            mediaId={mediaId}
            mediaUrl={mediaUrl}
          />
        )
      case 'advanced':
        return (
          <AdvancedTab
            editorState={editorState}
            onStateUpdate={onStateUpdate}
            projectId={projectId}
            mediaId={mediaId}
            mediaUrl={mediaUrl}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation - Horizontal responsive */}
      <div className="flex-shrink-0 border-b border-white/20">
        {/* Mobile: Scrollable horizontal tabs */}
        <div className="flex sm:hidden overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = editorState.activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 flex items-center space-x-2 tab-transition touch-active relative touch-manipulation min-w-[120px] ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{tab.name}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = editorState.activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 flex flex-col items-center justify-center tab-transition touch-active relative group h-16 lg:h-20 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5 mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
                
                {/* Tooltip - Desktop only */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {tab.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content - Mobile optimized scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 image-editor-scroll momentum-scroll">
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pb-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Before/After Toggle - Mobile responsive */}
      <div className="flex-shrink-0 border-t border-white/20 bg-black/20">
        {/* Before/After Toggle - Mobile optimized */}
        <div className="p-2">
          <button
            onClick={() => onStateUpdate({ showBeforeAfter: !editorState.showBeforeAfter })}
            className={`w-full p-3 sm:p-2 rounded-lg transition-all flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] ${
              editorState.showBeforeAfter 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {editorState.showBeforeAfter ? 'Hide Comparison' : 'Show Before/After'}
            </span>
          </button>
        </div>
        
        {/* Quick Stats - Hidden on mobile to save space */}
        <div className="hidden sm:block px-2 pb-2">
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="py-1">
              <div className="text-xs text-white/40">Brightness</div>
              <div className="text-xs text-white font-medium">
                {editorState.brightness > 0 ? '+' : ''}{editorState.brightness}
              </div>
            </div>
            <div className="py-1">
              <div className="text-xs text-white/40">Contrast</div>
              <div className="text-xs text-white font-medium">
                {editorState.contrast > 0 ? '+' : ''}{editorState.contrast}
              </div>
            </div>
            <div className="py-1">
              <div className="text-xs text-white/40">Saturation</div>
              <div className="text-xs text-white font-medium">
                {editorState.saturation > 0 ? '+' : ''}{editorState.saturation}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}