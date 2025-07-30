'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Project } from '@/types/project'
import projectsData from '@/data/projects.json'

export default function CurrentProjectsCarousel() {
  const projects = projectsData as Project[]
  const currentProjects = projects.filter(project => project.category === 'current')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentProjects.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [currentProjects.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % currentProjects.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + currentProjects.length) % currentProjects.length)
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
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-lg shadow-xl group">
      {/* Main Image */}
      <div className="relative w-full h-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
        <div className="text-center text-stone-600">
          <div className="text-sm mb-2">Projekt Visualisierung</div>
          <div className="text-2xl font-bold mb-1">{currentProject.name}</div>
          <div className="text-sm">{currentProject.location}</div>
        </div>
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
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentProject.status === 'verfügbar' ? 'VERFÜGBAR' : currentProject.status.toUpperCase()}
            </span>
            <Link 
              href={`/projekte/${currentProject.id}`}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
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
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {currentProjects.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {currentProjects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Project Counter */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
        {currentIndex + 1} / {currentProjects.length}
      </div>
    </div>
  )
}