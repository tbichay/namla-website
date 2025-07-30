'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageSliderProps {
  images: string[]
  projectName: string
}

export default function ImageSlider({ images, projectName }: ImageSliderProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-lg">Keine Bilder verfügbar</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        <Image
          src={images[currentImage]}
          alt={`${projectName} - Bild ${currentImage + 1}`}
          fill
          className="object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors"
            aria-label="Vorheriges Bild"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors"
            aria-label="Nächstes Bild"
          >
            →
          </button>
          
          <div className="flex justify-center space-x-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImage ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Bild ${index + 1} anzeigen`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}