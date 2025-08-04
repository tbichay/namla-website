'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProjectCard from '@/components/ProjectCard'
import HistoricalTimelineCard from '@/components/HistoricalTimelineCard'
import { CurrentProject, HistoricalProject } from '@/types/project'
import { adaptProjectsForPublic } from '@/lib/project-adapters'
import { calculateProjectMetrics, formatMetricWithPlus, formatMetric } from '@/lib/project-metrics'
import type { Project as DbProject } from '@/lib/db'

export default function ProjectsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'
  const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Redirect public users to coming soon page
  useEffect(() => {
    if (comingSoonMode && !isAdmin) {
      router.push('/')
    }
  }, [comingSoonMode, isAdmin, router])
  const [currentProjects, setCurrentProjects] = useState<CurrentProject[]>([])
  const [historicalProjects, setHistoricalProjects] = useState<HistoricalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (response.ok) {
        // API returns separated projects, so we can use them directly
        const dbProjects = [...(data.current || []), ...(data.historical || [])] as DbProject[]
        const { currentProjects: current, historicalProjects: historical } = adaptProjectsForPublic(dbProjects)
        
        setCurrentProjects(current)
        setHistoricalProjects(historical)
      } else {
        setError('Failed to load projects')
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-12 bg-stone-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-stone-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-stone-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
              Projekte konnten nicht geladen werden
            </h1>
            <p className="text-stone-600 mb-6">{error}</p>
            <button 
              onClick={fetchProjects}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Current Projects Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4 sm:mb-6">
            Aktuelle Projekte
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Entdecken Sie unsere aktuellen Wohnprojekte mit hochwertiger Ausstattung 
            und modernen Grundrissen in besten Lagen.
          </p>
        </div>

        {/* Current Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {currentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {currentProjects.length} Projekte aktuell verfügbar
          </div>
        </div>
      </section>

      {/* Historical Projects Timeline */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-4 sm:mb-6">
              Unsere Erfolgsgeschichte
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Von heute bis zu unseren Anfängen – über 26 Jahre Erfahrung im Wohnungsbau 
              mit mehr als 150 geschaffenen Wohneinheiten in der Region Ulm.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Timeline Navigation - Dynamic years based on real data */}
            {historicalProjects.length > 0 && (
              <div className="flex justify-center items-center mb-8 text-sm text-stone-500">
                <span>{Math.max(...historicalProjects.map(p => p.year))}</span>
                <div className="flex-1 mx-4 h-px bg-stone-200 relative">
                  <div className="absolute left-0 w-8 h-px bg-amber-600"></div>
                </div>
                <span>{Math.min(...historicalProjects.map(p => p.year))}</span>
              </div>
            )}

            {/* Scrollable Timeline */}
            <div className="relative">
              <div 
                id="timeline-scroll"
                className="overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-6 px-4" style={{ width: 'max-content' }}>
                  {historicalProjects.map((project, index) => (
                    <HistoricalTimelineCard 
                      key={project.id} 
                      project={project} 
                      index={index}
                      total={historicalProjects.length}
                    />
                  ))}
                </div>
              </div>

              {/* Scroll Navigation Buttons */}
              <button 
                onClick={() => {
                  const container = document.getElementById('timeline-scroll')
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' })
                  }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-stone-600 hover:text-stone-800 p-3 rounded-full transition-all duration-300 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('timeline-scroll')
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' })
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-stone-600 hover:text-stone-800 p-3 rounded-full transition-all duration-300 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Timeline Stats - Using real data */}
            {(() => {
              const metrics = calculateProjectMetrics(historicalProjects, currentProjects)
              return (
                <div className="flex justify-center items-center mt-8 space-x-8 text-center">
                  <div>
                    <div className="text-2xl font-bold text-stone-800">{formatMetric(metrics.completedProjectsCount)}</div>
                    <div className="text-sm text-stone-600">Erfolgreich realisiert</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-800">{formatMetricWithPlus(metrics.yearsExperience)}</div>
                    <div className="text-sm text-stone-600">Jahre Erfahrung</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-800">{formatMetricWithPlus(metrics.totalUnits)}</div>
                    <div className="text-sm text-stone-600">Wohneinheiten</div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>
    </div>
  )
}