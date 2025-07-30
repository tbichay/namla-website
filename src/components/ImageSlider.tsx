'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface ImageSliderProps {
  images: string[]
  projectName: string
}

export default function ImageSlider({ images, projectName }: ImageSliderProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextImage()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextImage, prevImage])

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-lg">Keine Bilder verfügbar</span>
      </div>
    )
  }

  return (
    <div className="relative" role="region" aria-label={`Bildergalerie für ${projectName}`}>
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        <Image
          src={images[currentImage]}
          alt={`${projectName} - Bild ${currentImage + 1} von ${images.length}`}
          fill
          className="object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-sm"
            aria-label="Vorheriges Bild anzeigen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-sm"
            aria-label="Nächstes Bild anzeigen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex justify-center space-x-2 mt-4" role="tablist" aria-label="Bildauswahl">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                role="tab"
                aria-selected={index === currentImage}
                aria-controls={`image-${index}`}
                className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 ${
                  index === currentImage ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Bild ${index + 1} von ${images.length} anzeigen`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}