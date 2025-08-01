'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface LightboxGalleryProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  projectName: string
}

export default function LightboxGallery({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0,
  projectName 
}: LightboxGalleryProps) {
  // Filter out empty/invalid images
  const validImages = useMemo(() => 
    images.filter(img => img && img.trim().length > 0), 
    [images]
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset to initial index when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, validImages.length - 1))
    }
  }, [isOpen, initialIndex, validImages.length])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentIndex((prev) => (prev + 1) % validImages.length)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden' // Prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, validImages.length, onClose])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  // Early returns to prevent rendering issues
  if (!isOpen) return null
  if (validImages.length === 0) return null
  
  // Use portal to render outside of parent container
  // Add safety check for document.body
  if (typeof window === 'undefined' || !document.body) return null
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      aria-describedby="lightbox-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full max-w-6xl max-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div>
            <h3 id="lightbox-title" className="text-lg font-medium">{projectName}</h3>
            <p id="lightbox-description" className="text-sm opacity-75">
              Bild {currentIndex + 1} von {validImages.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Galerie schließen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Image */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={validImages[currentIndex]}
              alt={`${projectName} - Bild ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Vorheriges Bild"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Nächstes Bild"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {validImages.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'ring-2 ring-white opacity-100' 
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}