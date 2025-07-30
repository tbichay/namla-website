'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import ImageSlider from '@/components/ImageSlider'
import Button from '@/components/ui/Button'
import projectsData from '@/data/projects.json'

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = use(params)
  const project = projectsData.find(p => p.id === slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb & Header - Mobile First */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-stone-500 mb-4 text-sm sm:text-base px-2 sm:px-0">
            <a href="/projekte" className="hover:text-stone-800 transition-colors">
              Projekte
            </a>
            <span className="mx-2">→</span>
            <span className="truncate">{project.name}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
            <div className="px-2 sm:px-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-2 leading-tight">
                {project.name}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-stone-600">{project.location}</p>
            </div>
            <div className="px-2 sm:px-0">
              <span
                className={`inline-block px-3 sm:px-4 py-2 text-sm sm:text-base lg:text-lg font-medium rounded-full ${
                  project.status === 'verfügbar'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ImageSlider images={project.images} projectName={project.name} />
            
            <div className="mt-6 sm:mt-8 px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">Beschreibung</h2>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base lg:text-lg">
                {project.description}
              </p>
            </div>

            {project.floorPlan && (
              <div className="mt-8 sm:mt-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">Grundriss</h2>
                <div className="aspect-[4/3] bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={project.floorPlan}
                    alt={`${project.name} - Grundriss`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4 sm:mb-6">Details</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                  <span className="text-stone-500">Wohnfläche</span>
                  <span className="font-medium text-stone-800">{project.details.livingSpace}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                  <span className="text-stone-500">Zimmer</span>
                  <span className="font-medium text-stone-800">{project.details.rooms}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                  <span className="text-stone-500">Preis</span>
                  <span className="font-medium text-stone-800">{project.details.price}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                  <span className="text-stone-500">Fertigstellung</span>
                  <span className="font-medium text-stone-800">{project.details.completion}</span>
                </div>
                <div className="flex justify-between py-2 text-sm sm:text-base">
                  <span className="text-stone-500">Status</span>
                  <span className="font-medium text-stone-800 capitalize">{project.status}</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <Button href="/kontakt" className="w-full text-center">
                  Jetzt anfragen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}