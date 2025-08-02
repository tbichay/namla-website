'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  alt?: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onLoadStart?: () => void
  onLoadedData?: () => void
  onError?: (error: Event) => void
  onCanPlay?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  width?: number
  height?: number
  style?: React.CSSProperties
  // Auto-generate poster from video thumbnail
  autoGeneratePoster?: boolean
  projectId?: string
  mediaId?: string
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  poster,
  alt,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  onLoadStart,
  onLoadedData,
  onError,
  onCanPlay,
  onMouseEnter,
  onMouseLeave,
  width,
  height,
  style,
  autoGeneratePoster = false,
  projectId,
  mediaId,
  ...props
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [volume, setVolume] = useState(1)
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-generate poster if enabled
  useEffect(() => {
    if (autoGeneratePoster && projectId && mediaId && !poster) {
      setGeneratedPoster(`/api/admin/projects/${projectId}/media/${mediaId}/thumbnail`)
    }
  }, [autoGeneratePoster, projectId, mediaId, poster])

  // Combine refs
  useEffect(() => {
    if (ref && videoRef.current) {
      if (typeof ref === 'function') {
        ref(videoRef.current)
      } else {
        ref.current = videoRef.current
      }
    }
  }, [ref])

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Video event handlers
  const handleLoadStart = () => {
    setIsLoading(true)
    setLoadError(null)
    onLoadStart?.()
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleLoadedData = () => {
    setIsLoading(false)
    onLoadedData?.()
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    onCanPlay?.()
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsLoading(false)
    setLoadError('Failed to load video')
    onError?.(e.nativeEvent)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleVolumeChangeEvent = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume)
      setIsMuted(videoRef.current.muted)
    }
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div 
      className={`relative group bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => {
        controls && showControlsTemporarily()
        onMouseEnter?.()
      }}
      onMouseMove={() => controls && showControlsTemporarily()}
      onMouseLeave={() => {
        controls && setShowControls(false)
        onMouseLeave?.()
      }}
      style={style}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster || generatedPoster || undefined}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        preload={preload}
        onLoadStart={handleLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleVolumeChangeEvent}
        className="w-full h-full object-cover"
        {...props}
      >
        {alt && <track kind="descriptions" label="Video description" />}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading video...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-lg mb-2">⚠️</div>
            <div className="text-sm">{loadError}</div>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isLoading && !loadError && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-4 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          )}
        </div>
      )}

      {/* Custom Controls */}
      {controls && !loadError && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2 group/volume">
                <button
                  onClick={handleMute}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                {/* Volume Slider */}
                <div className="w-0 group-hover/volume:w-16 overflow-hidden transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer