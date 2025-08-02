'use client'

import { useState } from 'react'
import { Layers, Sun, Cloud, Home, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  icon?: React.ComponentType<any>
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, className = '' }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border border-white/10 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation min-h-[56px]"
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-white/70" />}
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/50" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-3 sm:p-4 bg-white/5 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  )
}

interface EditorState {
  isProcessing: boolean
}

interface AdvancedTabProps {
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
  projectId: string
  mediaId: string
  mediaUrl: string
}

const advancedFeatures = [
  {
    id: 'hdr',
    name: 'HDR Processing',
    icon: Sun,
    description: 'High Dynamic Range tone mapping for better exposure balance',
    color: 'yellow',
    options: {
      strength: 70,
      toneMapping: 'balanced',
      shadowLift: 30,
      highlightRecovery: 40
    }
  },
  {
    id: 'sky_replacement',
    name: 'Sky Replacement',
    icon: Cloud,
    description: 'Replace dull skies with dramatic weather or blue skies',
    color: 'blue',
    options: {
      skyType: 'dramatic_sunset',
      blendMode: 'natural',
      lighting: 'auto'
    }
  },
  {
    id: 'virtual_staging',
    name: 'Virtual Staging',
    icon: Home,
    description: 'Add furniture and decor to empty interior spaces',
    color: 'green',
    options: {
      roomType: 'living_room',
      stylePreference: 'modern',
      furnishingLevel: 'moderate'
    }
  }
]

const skyTypes = [
  { id: 'clear_blue', name: 'Clear Blue Sky', preview: '☀️' },
  { id: 'dramatic_sunset', name: 'Dramatic Sunset', preview: '🌅' },
  { id: 'stormy_clouds', name: 'Stormy Clouds', preview: '⛈️' },
  { id: 'golden_hour', name: 'Golden Hour', preview: '🌇' },
  { id: 'overcast', name: 'Soft Overcast', preview: '☁️' }
]

const roomTypes = [
  { id: 'living_room', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍽️' },
  { id: 'office', name: 'Office', icon: '💼' },
  { id: 'dining_room', name: 'Dining Room', icon: '🍽️' }
]

export default function AdvancedTab({
  editorState,
  onStateUpdate,
  projectId,
  mediaId,
  mediaUrl
}: AdvancedTabProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [hdrOptions, setHdrOptions] = useState({
    strength: 70,
    toneMapping: 'balanced',
    shadowLift: 30,
    highlightRecovery: 40
  })
  const [skyOptions, setSkyOptions] = useState({
    skyType: 'dramatic_sunset',
    blendMode: 'natural',
    lighting: 'auto'
  })
  const [stagingOptions, setStagingOptions] = useState({
    roomType: 'living_room',
    stylePreference: 'modern',
    furnishingLevel: 'moderate'
  })

  const processAdvancedFeature = async (featureId: string) => {
    try {
      onStateUpdate({ isProcessing: true })
      
      let options = {}
      if (featureId === 'hdr') options = hdrOptions
      if (featureId === 'sky_replacement') options = skyOptions
      if (featureId === 'virtual_staging') options = stagingOptions
      
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaId}/advanced-enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enhancementType: featureId,
          [`${featureId}Options`]: options
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const feature = advancedFeatures.find(f => f.id === featureId)
        toast.success(`${feature?.name} completed!`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Processing failed')
      }
      
    } catch (error) {
      console.error('Advanced processing failed:', error)
      toast.error('Processing failed')
    } finally {
      onStateUpdate({ isProcessing: false })
      setActiveFeature(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* AI Enhancement Features - Collapsible */}
      <CollapsibleSection 
        title="AI Enhancement Features" 
        icon={Layers}
        defaultOpen={true}
        className="mb-4"
      >
        <div className="space-y-3">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon
            const isActive = activeFeature === feature.id
            const colorClasses = {
              yellow: 'border-yellow-500/50 bg-yellow-500/10',
              blue: 'border-blue-500/50 bg-blue-500/10',
              green: 'border-green-500/50 bg-green-500/10'
            }
            
            return (
              <div key={feature.id} className="space-y-3">
                <div
                  className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer touch-manipulation ${
                    isActive 
                      ? colorClasses[feature.color as keyof typeof colorClasses]
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-white/15'
                  }`}
                  onClick={() => setActiveFeature(isActive ? null : feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <div>
                      <h4 className="font-medium text-white">{feature.name}</h4>
                      <p className="text-sm text-white/70">{feature.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      processAdvancedFeature(feature.id)
                    }}
                    disabled={editorState.isProcessing}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      editorState.isProcessing
                        ? 'bg-gray-500/50 text-white cursor-not-allowed'
                        : `bg-${feature.color}-500 hover:bg-${feature.color}-600 text-white`
                    }`}
                  >
                    {editorState.isProcessing ? 'Processing...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Feature Options */}
              {isActive && (
                <div className="ml-4 p-4 bg-white/5 rounded-lg border-l-4 border-white/20">
                  {feature.id === 'hdr' && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-white flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        HDR Settings
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-white/70 block mb-1">Strength</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={hdrOptions.strength}
                            onChange={(e) => setHdrOptions({...hdrOptions, strength: Number(e.target.value)})}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="text-xs text-white/50 mt-1">{hdrOptions.strength}%</div>
                        </div>
                        
                        <div>
                          <label className="text-sm text-white/70 block mb-1">Tone Mapping</label>
                          <select
                            value={hdrOptions.toneMapping}
                            onChange={(e) => setHdrOptions({...hdrOptions, toneMapping: e.target.value})}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                          >
                            <option value="natural">Natural</option>
                            <option value="balanced">Balanced</option>
                            <option value="dramatic">Dramatic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {feature.id === 'sky_replacement' && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-white flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Sky Options
                      </h5>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {skyTypes.map((sky) => (
                          <button
                            key={sky.id}
                            onClick={() => setSkyOptions({...skyOptions, skyType: sky.id})}
                            className={`p-2 rounded border text-sm transition-colors ${
                              skyOptions.skyType === sky.id
                                ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-lg mb-1">{sky.preview}</div>
                            <div className="text-xs">{sky.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.id === 'virtual_staging' && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-white flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Staging Options
                      </h5>
                      
                      <div>
                        <label className="text-sm text-white/70 block mb-2">Room Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {roomTypes.map((room) => (
                            <button
                              key={room.id}
                              onClick={() => setStagingOptions({...stagingOptions, roomType: room.id})}
                              className={`p-2 rounded border text-sm transition-colors ${
                                stagingOptions.roomType === room.id
                                  ? 'bg-green-500/20 border-green-500/50 text-white'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="text-lg mb-1">{room.icon}</div>
                              <div className="text-xs">{room.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-white/70 block mb-1">Style</label>
                        <select
                          value={stagingOptions.stylePreference}
                          onChange={(e) => setStagingOptions({...stagingOptions, stylePreference: e.target.value})}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                        >
                          <option value="modern">Modern</option>
                          <option value="traditional">Traditional</option>
                          <option value="minimalist">Minimalist</option>
                          <option value="luxury">Luxury</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        </div>
      </CollapsibleSection>

      {/* Processing Information - Collapsible */}
      <CollapsibleSection 
        title="Processing Information" 
        icon={Settings}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {/* Cost Estimate */}
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-amber-400">💰</span>
              <span className="text-sm font-medium text-amber-200">Processing Costs</span>
            </div>
            <div className="text-xs text-amber-100 space-y-1">
              <div>HDR Processing: $0.15 per image</div>
              <div>Sky Replacement: $0.25 per image</div>
              <div>Virtual Staging: $0.50 per image</div>
            </div>
          </div>
          
          {/* Processing Time Info */}
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-400">⏱️</span>
              <span className="text-sm font-medium text-blue-200">Processing Times</span>
            </div>
            <div className="text-xs text-blue-100 space-y-1">
              <div>HDR Processing: 30-60 seconds</div>
              <div>Sky Replacement: 1-2 minutes</div>
              <div>Virtual Staging: 2-5 minutes</div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Processing Status */}
      {editorState.isProcessing && (
        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-medium text-blue-200">
                Processing Advanced Enhancement...
              </div>
              <div className="text-xs text-blue-300">
                This may take 2-5 minutes depending on complexity
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}