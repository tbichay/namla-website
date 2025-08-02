'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import VideoPlayer from '@/components/ui/VideoPlayer'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  alt?: string
  caption?: string
  isMainImage?: boolean
  sortOrder?: number
  projectId?: string
}

interface MediaGalleryProps {
  items: MediaItem[]
  projectName: string
}

interface LightboxProps {
  items: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  projectName: string
}

function Lightbox({ items, currentIndex, onClose, onNext, onPrev, projectName }: LightboxProps) {
  const currentItem = items[currentIndex]

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNext, onPrev])

  const lightboxContent = (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Galerie schließen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white z-10"
              aria-label="Vorheriges Medium anzeigen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white z-10"
              aria-label="Nächstes Medium anzeigen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Media Content */}
        <div className="flex items-center justify-center w-full h-full">
          {currentItem.type === 'image' ? (
            <Image
              src={currentItem.url}
              alt={currentItem.alt || `${projectName} - Bild ${currentIndex + 1}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain"
              priority
            />
          ) : (
            <VideoPlayer
              src={currentItem.url}
              alt={currentItem.alt || `${projectName} - Video ${currentIndex + 1}`}
              className="max-w-full max-h-full"
              controls
              autoPlay
              muted
              preload="metadata"
              autoGeneratePoster
              projectId={currentItem.projectId}
              mediaId={currentItem.id}
            />
          )}
        </div>

        {/* Caption */}
        {currentItem.caption && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
            <p className="text-center">{currentItem.caption}</p>
          </div>
        )}

        {/* Counter */}
        {items.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {items.length}
          </div>
        )}
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(lightboxContent, document.body) : null
}

export default function MediaGallery({ items, projectName }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const nextItem = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const prevItem = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  if (items.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-lg">Keine Medien verfügbar</span>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <>
      <div className="relative" role="region" aria-label={`Mediengalerie für ${projectName}`}>
        {/* Main Display */}
        <div 
          className="aspect-[16/9] bg-gray-100 overflow-hidden relative cursor-pointer group"
          onClick={() => openLightbox(currentIndex)}
        >
          {currentItem.type === 'image' ? (
            <>
              <Image
                src={currentItem.url}
                alt={currentItem.alt || `${projectName} - Bild ${currentIndex + 1} von ${items.length}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Zoom Indicator */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <>
              <VideoPlayer
                src={currentItem.url}
                className="w-full h-full"
                controls={false}
                muted
                preload="metadata"
                autoGeneratePoster
                projectId={currentItem.projectId}
                mediaId={currentItem.id}
                onMouseEnter={() => {
                  // Auto-play on hover for preview
                  const video = document.querySelector(`video[src="${currentItem.url}"]`) as HTMLVideoElement
                  if (video) video.play()
                }}
                onMouseLeave={() => {
                  // Pause on mouse leave
                  const video = document.querySelector(`video[src="${currentItem.url}"]`) as HTMLVideoElement
                  if (video) video.pause()
                }}
              />
              {/* Play Indicator */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 p-3 rounded-full">
                  <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevItem}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-sm"
              aria-label="Vorheriges Medium anzeigen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextItem}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-sm"
              aria-label="Nächstes Medium anzeigen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Thumbnails */}
        {items.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4 overflow-x-auto pb-2" role="tablist" aria-label="Medienauswahl">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                onDoubleClick={() => openLightbox(index)}
                role="tab"
                aria-selected={index === currentIndex}
                className={`flex-shrink-0 w-16 h-12 relative rounded overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 ${
                  index === currentIndex 
                    ? 'ring-2 ring-amber-600 scale-110' 
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                aria-label={`${item.type === 'image' ? 'Bild' : 'Video'} ${index + 1} von ${items.length} anzeigen`}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          items={items}
          currentIndex={currentIndex}
          onClose={closeLightbox}
          onNext={nextItem}
          onPrev={prevItem}
          projectName={projectName}
        />
      )}
    </>
  )
}