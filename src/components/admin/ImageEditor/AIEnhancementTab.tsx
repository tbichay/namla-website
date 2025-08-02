'use client'

import { useState } from 'react'
import { Sparkles, Zap, Loader2, Download, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EditorState {
  isProcessing: boolean
}

interface AIEnhancementTabProps {
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
  projectId: string
  mediaId: string
  mediaUrl: string
  onEnhancementResult?: (enhancedUrl: string) => void
}

interface EnhancementPreset {
  id: string
  name: string
  description: string
  icon: string
  estimatedTime: string
  cost: string
}

const enhancementPresets: EnhancementPreset[] = [
  {
    id: 'ai_quick_enhance',
    name: 'Auto Enhance',
    description: 'AI automatically improves lighting, color, and sharpness',
    icon: '✨',
    estimatedTime: '30s',
    cost: '$0.05'
  },
  {
    id: 'ai_upscale',
    name: 'Super Resolution',
    description: 'Increase image resolution using AI upscaling',
    icon: '🔍',
    estimatedTime: '45s',
    cost: '$0.10'
  },
  {
    id: 'real_estate_standard',
    name: 'Real Estate Standard',
    description: 'Basic lighting and quality enhancement for property photos',
    icon: '🏠',
    estimatedTime: '25s',
    cost: '$0.03'
  },
  {
    id: 'ai_professional',
    name: 'Professional',
    description: 'Complete AI enhancement with sky replacement and perspective correction',
    icon: '⚡',
    estimatedTime: '60s',
    cost: '$0.08'
  },
  {
    id: 'high_resolution',
    name: 'High Resolution',
    description: 'Advanced detail enhancement and sharpening',
    icon: '🌈',
    estimatedTime: '35s',
    cost: '$0.04'
  },
  {
    id: 'real_estate_premium',
    name: 'Premium Real Estate',
    description: 'Complete enhancement with HDR and sky replacement',
    icon: '🌙',
    estimatedTime: '40s',
    cost: '$0.06'
  }
]

export default function AIEnhancementTab({
  editorState,
  onStateUpdate,
  projectId,
  mediaId,
  mediaUrl,
  onEnhancementResult
}: AIEnhancementTabProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [processingPreset, setProcessingPreset] = useState<string>('')
  const [enhancementResults, setEnhancementResults] = useState<Record<string, string>>({})

  const handleEnhancement = async (presetId: string) => {
    try {
      setProcessingPreset(presetId)
      onStateUpdate({ isProcessing: true })
      
      console.log('🚀 Starting AI enhancement:', { presetId, projectId, mediaId, mediaUrl })
      
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: presetId,
          targetUrl: mediaUrl
        })
      })
      
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Enhancement result:', result)
        
        // Handle different response structures
        const enhancedUrl = result.enhancement?.enhanced_url || result.enhanced_url
        
        if (enhancedUrl) {
          setEnhancementResults(prev => ({
            ...prev,
            [presetId]: enhancedUrl
          }))
          // Notify parent component about the enhancement result
          if (onEnhancementResult) {
            onEnhancementResult(enhancedUrl)
          }
          toast.success(`${enhancementPresets.find(p => p.id === presetId)?.name} completed!`)
        } else {
          console.error('❌ No enhanced URL in response:', result)
          toast.error('Enhancement completed but no result URL received')
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Enhancement error:', error)
        toast.error(error.error || 'Enhancement failed')
      }
      
    } catch (error) {
      console.error('💥 Enhancement exception:', error)
      toast.error('Enhancement failed')
    } finally {
      setProcessingPreset('')
      onStateUpdate({ isProcessing: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhancement Presets */}
      <div className="space-y-3">
        {enhancementPresets.map((preset) => {
          const isProcessing = processingPreset === preset.id
          const hasResult = enhancementResults[preset.id]
          
          return (
            <div
              key={preset.id}
              className={`p-4 rounded-lg border transition-all ${
                selectedPreset === preset.id
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{preset.icon}</span>
                    <h4 className="font-medium text-white">{preset.name}</h4>
                    {hasResult && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  
                  <p className="text-sm text-white/70 mb-3">
                    {preset.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-white/50">
                    <span>⏱️ {preset.estimatedTime}</span>
                    <span>💰 {preset.cost}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleEnhancement(preset.id)}
                    disabled={isProcessing || editorState.isProcessing}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isProcessing
                        ? 'bg-blue-500/50 text-white cursor-not-allowed'
                        : hasResult
                        ? 'bg-green-500/50 hover:bg-green-500/70 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : hasResult ? (
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Re-run</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Enhance</span>
                      </div>
                    )}
                  </button>
                  
                  {hasResult && (
                    <button
                      onClick={() => window.open(enhancementResults[preset.id], '_blank')}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                    >
                      View Result
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Smart Suggestions */}
      <div className="space-y-4">
        <h4 className="font-medium text-white flex items-center">
          <span className="mr-2">🧠</span>
          Smart Suggestions
        </h4>
        
        <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Recommended for this image</span>
          </div>
          
          <ul className="text-sm text-purple-100 space-y-1">
            <li>• This image would benefit from noise reduction</li>
            <li>• Low light boost could improve visibility</li>
            <li>• Auto enhance will balance the colors</li>
          </ul>
          
          <button
            onClick={() => {
              handleEnhancement('noise_reduction')
              setTimeout(() => handleEnhancement('low_light'), 2000)
              setTimeout(() => handleEnhancement('auto_enhance'), 4000)
            }}
            disabled={editorState.isProcessing}
            className="mt-3 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
          >
            Apply All Suggestions
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {editorState.isProcessing && (
        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <div>
              <div className="text-sm font-medium text-blue-200">
                Processing Enhancement...
              </div>
              <div className="text-xs text-blue-300">
                This may take up to 60 seconds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {Object.keys(enhancementResults).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-white flex items-center">
            <span className="mr-2">📊</span>
            Enhancement Results
          </h4>
          
          <div className="space-y-2">
            {Object.entries(enhancementResults).map(([presetId, resultUrl]) => {
              const preset = enhancementPresets.find(p => p.id === presetId)
              if (!preset) return null
              
              return (
                <div key={presetId} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center space-x-2">
                    <span>{preset.icon}</span>
                    <span className="text-sm text-white">{preset.name}</span>
                  </div>
                  <button
                    onClick={() => window.open(resultUrl, '_blank')}
                    className="text-xs px-2 py-1 bg-green-500/50 hover:bg-green-500/70 text-white rounded transition-colors"
                  >
                    View
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}