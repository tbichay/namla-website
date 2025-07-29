'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProjectCard from '@/components/ProjectCard'
import projectsData from '@/data/projects.json'

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'
  const [filter, setFilter] = useState<'all' | 'verfügbar' | 'verkauft'>(
    initialFilter as 'all' | 'verfügbar' | 'verkauft'
  )

  const filteredProjects = projectsData.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Unsere Projekte
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entdecken Sie unsere hochwertigen Wohnprojekte – von modernen 
            Stadtquartieren bis zu exklusiven Villen.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex border border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black'
              }`}
            >
              Alle Projekte
            </button>
            <button
              onClick={() => setFilter('verfügbar')}
              className={`px-6 py-3 font-medium transition-colors border-l border-gray-200 ${
                filter === 'verfügbar'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black'
              }`}
            >
              Verfügbar
            </button>
            <button
              onClick={() => setFilter('verkauft')}
              className={`px-6 py-3 font-medium transition-colors border-l border-gray-200 ${
                filter === 'verkauft'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black'
              }`}
            >
              Verkauft
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Keine Projekte in dieser Kategorie gefunden.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}