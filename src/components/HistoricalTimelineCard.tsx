'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HistoricalProject } from '@/types/project'
import LightboxGallery from './LightboxGallery'

interface HistoricalTimelineCardProps {
  project: HistoricalProject
  index: number
  total: number
}

export default function HistoricalTimelineCard({ 
  project, 
  index, 
  total 
}: HistoricalTimelineCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Calculate visual evolution effects (newer = more vibrant, older = more muted)
  const ageRatio = index / (total - 1) // 0 = newest, 1 = oldest
  const opacity = 1 - (ageRatio * 0.2) // Range from 1.0 to 0.8
  const saturation = 100 - (ageRatio * 30) // Range from 100% to 70%

  const openLightbox = () => {
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  return (
    <>
      <div 
        className="flex-shrink-0 w-48 group cursor-pointer relative transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openLightbox}
        style={{ 
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          zIndex: isHovered ? 10 : 1
        }}
      >
        {/* Main Project Image */}
        <div 
          className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-lg transition-all duration-300"
          style={{ 
            opacity,
            filter: `saturate(${isHovered ? 100 : saturation}%)` 
          }}
        >
          {/* Main project image or placeholder */}
          {project.images.length > 0 ? (
            <Image
              src={project.images[0]}
              alt={project.name}
              fill
              className="object-cover transition-all duration-300"
              style={{
                filter: isHovered ? 'none' : 'grayscale(0.3)'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
              <div className="text-center text-stone-500">
                <div className="text-xs mb-1">Projekt {project.year}</div>
                <div className="text-2xl font-bold">{project.year}</div>
              </div>
            </div>
          )}

          {/* Hover Preview Overlay */}
          {isHovered && project.images.length > 1 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              {/* Preview Thumbnails */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex space-x-1 mb-2">
                  {project.images.slice(1, 4).map((image, imgIndex) => (
                    <div 
                      key={imgIndex}
                      className="relative w-8 h-8 rounded bg-white/20 backdrop-blur-sm overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Preview ${imgIndex + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {project.images.length > 4 && (
                    <div className="w-8 h-8 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        +{project.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Gallery Hint */}
                <div className="text-white text-xs font-medium opacity-90">
                  Click to view gallery
                </div>
              </div>
            </div>
          )}

          {/* Single Image Hint */}
          {isHovered && project.images.length === 1 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-white text-xs font-medium opacity-90">
                  Click to enlarge
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="text-center">
          {/* Year Badge */}
          <div 
            className="inline-block px-3 py-1 bg-stone-800 text-white text-xs font-bold rounded-full mb-2 transition-all duration-300"
            style={{ 
              opacity,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {project.year}
          </div>
          
          {/* Project Name */}
          <h3 className="font-semibold text-stone-800 text-sm leading-tight mb-1 transition-colors line-clamp-2 group-hover:text-amber-600">
            {project.name}
          </h3>
          
          {/* Location */}
          <p className="text-xs text-stone-500 mb-2">{project.location}</p>
          
          {/* Unit Count */}
          <div className="flex justify-center">
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
              {project.units} EH
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Gallery */}
      <LightboxGallery
        images={project.images}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        projectName={project.name}
      />
    </>
  )
}