'use client'

import { useState } from 'react'
import { Palette, Upload, Bookmark, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EditorState {
  isProcessing: boolean
}

interface StyleTransferTabProps {
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
  projectId: string
  mediaId: string
  mediaUrl: string
}

const stylePresets = [
  { id: 'impressionist', name: 'Impressionist', preview: '🎨', description: 'Van Gogh style brushstrokes' },
  { id: 'watercolor', name: 'Watercolor', preview: '🖌️', description: 'Soft watercolor painting effect' },
  { id: 'oil_painting', name: 'Oil Painting', preview: '🖼️', description: 'Classic oil painting texture' },
  { id: 'sketch', name: 'Pencil Sketch', preview: '✏️', description: 'Hand-drawn pencil sketch' },
  { id: 'pop_art', name: 'Pop Art', preview: '🎭', description: 'Bold pop art colors' },
  { id: 'vintage', name: 'Vintage', preview: '📷', description: 'Retro vintage film look' }
]

export default function StyleTransferTab({
  editorState,
  onStateUpdate,
  projectId,
  mediaId,
  mediaUrl
}: StyleTransferTabProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('')
  const [savedStyles, setSavedStyles] = useState<Array<{id: string, name: string, url: string}>>([])

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      const url = URL.createObjectURL(file)
      setReferenceImageUrl(url)
    }
  }

  const applyStyleTransfer = async (styleId: string) => {
    try {
      onStateUpdate({ isProcessing: true })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success(`${stylePresets.find(s => s.id === styleId)?.name} style applied!`)
      
    } catch (error) {
      toast.error('Style transfer failed')
    } finally {
      onStateUpdate({ isProcessing: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Reference Image Upload */}
      <div className="space-y-4">
        <h4 className="font-medium text-white flex items-center">
          <span className="mr-2">📁</span>
          Upload Reference Style
        </h4>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleReferenceUpload}
            className="hidden"
            id="reference-upload"
          />
          <label
            htmlFor="reference-upload"
            className="block w-full p-4 border-2 border-dashed border-white/30 hover:border-white/50 rounded-lg cursor-pointer transition-colors"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
              <div className="text-sm text-white/70">
                Click to upload a reference image
              </div>
              <div className="text-xs text-white/50 mt-1">
                JPG, PNG up to 10MB
              </div>
            </div>
          </label>
        </div>
        
        {referenceImageUrl && (
          <div className="relative">
            <img
              src={referenceImageUrl}
              alt="Reference style"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setReferenceImage(null)
                setReferenceImageUrl('')
              }}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyStyleTransfer('custom')}
              disabled={editorState.isProcessing}
              className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
            >
              Apply Style
            </button>
          </div>
        )}
      </div>

      {/* Preset Styles */}
      <div className="space-y-4">
        <h4 className="font-medium text-white flex items-center">
          <span className="mr-2">🎨</span>
          Preset Styles
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {stylePresets.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                setSelectedStyle(style.id)
                applyStyleTransfer(style.id)
              }}
              disabled={editorState.isProcessing}
              className={`p-3 rounded-lg border transition-all text-left ${
                selectedStyle === style.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">{style.preview}</div>
              <div className="text-sm font-medium text-white">{style.name}</div>
              <div className="text-xs text-white/60">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Styles */}
      <div className="space-y-4">
        <h4 className="font-medium text-white flex items-center">
          <Bookmark className="w-4 h-4 mr-2" />
          Saved Styles
        </h4>
        
        {savedStyles.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-white/50 text-sm">
              No saved styles yet. Apply a style to save it.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {savedStyles.map((style) => (
              <div key={style.id} className="relative group">
                <img
                  src={style.url}
                  alt={style.name}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => applyStyleTransfer(style.id)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                  {style.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-white flex items-center">
          <span className="mr-2">⚙️</span>
          Style Options
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70 block mb-1">Style Strength</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Subtle</span>
              <span>Strong</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-white/70 block mb-1">Preserve Details</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Artistic</span>
              <span>Realistic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {editorState.isProcessing && (
        <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-medium text-purple-200">
                Applying Style Transfer...
              </div>
              <div className="text-xs text-purple-300">
                This may take 1-2 minutes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}