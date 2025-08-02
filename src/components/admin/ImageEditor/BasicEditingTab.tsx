'use client'

import { useState } from 'react'
import { 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop, 
  RefreshCw,
  Move,
  Maximize2
} from 'lucide-react'

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
}

interface BasicEditingTabProps {
  editorState: EditorState
  onStateUpdate: (updates: Partial<EditorState>) => void
}

interface SliderControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  color?: string
  icon?: React.ReactNode
}

function SliderControl({ 
  label, 
  value, 
  onChange, 
  min = -100, 
  max = 100, 
  step = 1, 
  suffix = '',
  color = 'blue',
  icon
}: SliderControlProps) {
  const percentage = ((value - min) / (max - min)) * 100
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500'
  }

  return (
    <div className="space-y-2 sm:space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-white/70">{icon}</span>}
          <label className="text-sm font-medium text-white">{label}</label>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70 min-w-[3rem] text-right">
            {value > 0 ? '+' : ''}{value}{suffix}
          </span>
          {value !== 0 && (
            <button
              onClick={() => onChange(0)}
              className="p-2 sm:p-1 text-white/50 hover:text-white/80 active:text-white transition-colors touch-manipulation min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4 sm:w-3 sm:h-3" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative touch-slider">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 sm:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
          style={{
            background: `linear-gradient(to right, 
              rgb(255,255,255,0.2) 0%, 
              rgb(255,255,255,0.2) ${percentage}%, 
              rgb(255,255,255,0.1) ${percentage}%, 
              rgb(255,255,255,0.1) 100%)`
          }}
        />
        <div 
          className={`absolute top-0 left-0 h-3 sm:h-2 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg pointer-events-none opacity-80`}
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 w-5 h-5 sm:w-4 sm:h-4 bg-white rounded-full border-2 border-gray-300 transform -translate-y-1/2 pointer-events-none shadow-sm"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  )
}

export default function BasicEditingTab({ editorState, onStateUpdate }: BasicEditingTabProps) {
  const [cropMode, setCropMode] = useState(false)

  // Adjustment controls
  const adjustmentControls = [
    {
      label: 'Brightness',
      value: editorState.brightness,
      onChange: (brightness: number) => onStateUpdate({ brightness }),
      color: 'yellow',
      icon: '☀️'
    },
    {
      label: 'Contrast',
      value: editorState.contrast,
      onChange: (contrast: number) => onStateUpdate({ contrast }),
      color: 'blue',
      icon: '◐'
    },
    {
      label: 'Saturation',
      value: editorState.saturation,
      onChange: (saturation: number) => onStateUpdate({ saturation }),
      color: 'purple',
      icon: '🎨'
    },
    {
      label: 'Hue',
      value: editorState.hue,
      onChange: (hue: number) => onStateUpdate({ hue }),
      min: -180,
      max: 180,
      suffix: '°',
      color: 'indigo',
      icon: '🌈'
    },
    {
      label: 'Exposure',
      value: editorState.exposure,
      onChange: (exposure: number) => onStateUpdate({ exposure }),
      color: 'orange',
      icon: '📷'
    },
    {
      label: 'Highlights',
      value: editorState.highlights,
      onChange: (highlights: number) => onStateUpdate({ highlights }),
      color: 'red',
      icon: '⚡'
    },
    {
      label: 'Shadows',
      value: editorState.shadows,
      onChange: (shadows: number) => onStateUpdate({ shadows }),
      color: 'green',
      icon: '🌑'
    }
  ]

  // Transform controls
  const handleRotate = (degrees: number) => {
    onStateUpdate({ rotation: (editorState.rotation + degrees) % 360 })
  }

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      onStateUpdate({ flipHorizontal: !editorState.flipHorizontal })
    } else {
      onStateUpdate({ flipVertical: !editorState.flipVertical })
    }
  }

  const resetAllAdjustments = () => {
    onStateUpdate({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0
    })
  }

  const resetTransforms = () => {
    onStateUpdate({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
      scale: 1,
      cropArea: null
    })
  }

  const hasAdjustments = adjustmentControls.some(control => control.value !== 0)
  const hasTransforms = editorState.rotation !== 0 || editorState.flipHorizontal || editorState.flipVertical || editorState.scale !== 1

  return (
    <div className="space-y-6">
      {/* Color & Light Adjustments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🎛️</span>
            Color & Light
          </h3>
          {hasAdjustments && (
            <button
              onClick={resetAllAdjustments}
              className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {adjustmentControls.map((control) => (
            <SliderControl
              key={control.label}
              label={control.label}
              value={control.value}
              onChange={control.onChange}
              min={control.min}
              max={control.max}
              suffix={control.suffix}
              color={control.color}
              icon={control.icon}
            />
          ))}
        </div>
      </div>

      {/* Transform Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🔄</span>
            Transform
          </h3>
          {hasTransforms && (
            <button
              onClick={resetTransforms}
              className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              Reset Transform
            </button>
          )}
        </div>

        {/* Rotation */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleRotate(-90)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">90° Left</span>
          </button>
          
          <button
            onClick={() => handleRotate(90)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-sm">90° Right</span>
          </button>
        </div>

        {/* Current Rotation Display */}
        {editorState.rotation !== 0 && (
          <div className="text-center text-sm text-white/70">
            Current rotation: {editorState.rotation}°
          </div>
        )}

        {/* Flip Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleFlip('horizontal')}
            className={`p-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              editorState.flipHorizontal ? 'bg-blue-500/50' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="text-sm">Flip H</span>
          </button>
          
          <button
            onClick={() => handleFlip('vertical')}
            className={`p-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              editorState.flipVertical ? 'bg-blue-500/50' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span className="text-sm">Flip V</span>
          </button>
        </div>
      </div>

      {/* Scale Control */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📏</span>
          Scale
        </h3>
        
        <SliderControl
          label="Size"
          value={Math.round(editorState.scale * 100)}
          onChange={(value) => onStateUpdate({ scale: value / 100 })}
          min={10}
          max={300}
          suffix="%"
          color="blue"
          icon={<Maximize2 className="w-4 h-4" />}
        />
      </div>

      {/* Crop Control */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">✂️</span>
          Crop
        </h3>
        
        <button
          onClick={() => setCropMode(!cropMode)}
          className={`w-full p-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            cropMode ? 'bg-green-500/50' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Crop className="w-4 h-4" />
          <span>{cropMode ? 'Exit Crop Mode' : 'Enter Crop Mode'}</span>
        </button>
        
        {editorState.cropArea && (
          <div className="p-3 bg-white/10 rounded-lg">
            <div className="text-xs text-white/70 mb-2">Crop Area:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-white">
              <div>X: {editorState.cropArea.x}px</div>
              <div>Y: {editorState.cropArea.y}px</div>
              <div>W: {editorState.cropArea.width}px</div>
              <div>H: {editorState.cropArea.height}px</div>
            </div>
            <button
              onClick={() => onStateUpdate({ cropArea: null })}
              className="mt-2 text-xs px-2 py-1 bg-red-500/50 hover:bg-red-500/70 text-white rounded transition-colors"
            >
              Clear Crop
            </button>
          </div>
        )}
        
        {cropMode && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="text-xs text-yellow-200 mb-2">
              💡 Crop Mode Active
            </div>
            <div className="text-xs text-yellow-100">
              Click and drag on the image to select crop area
            </div>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">⚡</span>
          Quick Presets
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onStateUpdate({ brightness: 20, contrast: 15, saturation: 10 })}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            ☀️ Bright
          </button>
          
          <button
            onClick={() => onStateUpdate({ contrast: 30, saturation: 20 })}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            🎨 Vivid
          </button>
          
          <button
            onClick={() => onStateUpdate({ brightness: -10, contrast: 25, saturation: -20 })}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            🌙 Moody
          </button>
          
          <button
            onClick={() => onStateUpdate({ saturation: -100 })}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            ⚫ B&W
          </button>
        </div>
      </div>
    </div>
  )
}