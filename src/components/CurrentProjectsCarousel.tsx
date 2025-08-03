'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { CurrentProject } from '@/types/project'
import { adaptProjectsForPublic } from '@/lib/project-adapters'
import type { Project as DbProject } from '@/lib/db'

export default function CurrentProjectsCarousel() {
  const [currentProjects, setCurrentProjects] = useState<CurrentProject[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?category=current')
        const data = await response.json()
        
        if (response.ok && data.projects) {
          // Convert database projects to frontend format
          const { currentProjects: current } = adaptProjectsForPublic(data.projects as DbProject[])
          setCurrentProjects(current)
        }
      } catch (error) {
        console.error('Error fetching current projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % currentProjects.length)
  }, [currentProjects.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + currentProjects.length) % currentProjects.length)
  }, [currentProjects.length])

  // Auto-rotate carousel
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentProjects.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [currentProjects.length, isPlaying])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIsPlaying(false)
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIsPlaying(false)
        nextSlide()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('keydown', handleKeyDown)
      return () => carousel.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlaying, nextSlide, prevSlide])

  if (loading) {
    return (
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-stone-200 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-stone-500">Projekte werden geladen...</span>
      </div>
    )
  }

  if (currentProjects.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-stone-200 rounded-lg flex items-center justify-center">
        <span className="text-stone-500">Keine aktuellen Projekte verfügbar</span>
      </div>
    )
  }

  const currentProject = currentProjects[currentIndex]

  return (
    <div 
      ref={carouselRef}
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-lg shadow-xl group"
      role="region"
      aria-label="Aktuelle Projekte Karussell"
      aria-roledescription="Karussell"
      tabIndex={0}
    >
      {/* Screen reader only carousel description */}
      <div className="sr-only">
        Karussell mit {currentProjects.length} aktuellen Projekten. 
        Verwenden Sie die Pfeiltasten zum Navigieren oder die Leertaste zum Pausieren.
      </div>
      
      {/* Main Image */}
      <div className="relative w-full h-full">
        {currentProject.images && currentProject.images.length > 0 ? (
          <img
            src={currentProject.images[0]}
            alt={currentProject.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
            <div className="text-center text-stone-600">
              <div className="text-sm mb-2">Projekt Visualisierung</div>
              <div className="text-2xl font-bold mb-1">{currentProject.name}</div>
              <div className="text-sm">{currentProject.location}</div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

      {/* Content Overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 leading-tight">
              {currentProject.name}
            </h3>
            <p className="text-sm opacity-90 mb-2">{currentProject.location}</p>
            <div className="flex items-center space-x-4 text-xs">
              <span>{currentProject.details.rooms}</span>
              <span>{currentProject.details.livingSpace}</span>
              <span className="font-semibold">
                {currentProject.priceFrom === '---' 
                  ? 'Verkauft' 
                  : `ab ${parseInt(currentProject.priceFrom).toLocaleString('de-DE')} €`
                }
              </span>
            </div>
          </div>

          {/* Availability Badge */}
          <div className="flex flex-col items-end space-y-2">
            <span className={`text-white px-3 py-1 rounded-full text-xs font-medium ${
              currentProject.status === 'verfügbar'
                ? 'bg-green-500'
                : currentProject.status === 'verkauft'
                ? 'bg-gray-500'
                : currentProject.status === 'in_planung'
                ? 'bg-yellow-500'
                : currentProject.status === 'in_bau'
                ? 'bg-blue-500'
                : currentProject.status === 'fertiggestellt'
                ? 'bg-purple-500'
                : 'bg-stone-500' // fallback
            }`}>
              {currentProject.status.toUpperCase()}
            </span>
            <Link 
              href={`/projekte/${currentProject.id}`}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              aria-label={`Mehr über ${currentProject.name} erfahren`}
            >
              Mehr erfahren →
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentProjects.length > 1 && (
        <>
          <button
            onClick={() => { setIsPlaying(false); prevSlide(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:opacity-100"
            aria-label="Vorheriges Projekt anzeigen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => { setIsPlaying(false); nextSlide(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:opacity-100"
            aria-label="Nächstes Projekt anzeigen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {currentProjects.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2" role="tablist" aria-label="Projektauswahl">
          {currentProjects.map((project, index) => (
            <button
              key={index}
              onClick={() => { setIsPlaying(false); goToSlide(index); }}
              role="tab"
              aria-selected={index === currentIndex}
              aria-controls={`project-${index}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`${project.name} anzeigen`}
            />
          ))}
        </div>
      )}

      {/* Project Counter and Play/Pause */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          aria-label={isPlaying ? 'Karussell pausieren' : 'Karussell fortsetzen'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium" aria-live="polite">
          {currentIndex + 1} / {currentProjects.length}
        </div>
      </div>
    </div>
  )
}