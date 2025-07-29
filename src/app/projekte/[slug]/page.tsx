'use client'

import { notFound } from 'next/navigation'
import ImageSlider from '@/components/ImageSlider'
import Button from '@/components/ui/Button'
import projectsData from '@/data/projects.json'

interface ProjectDetailPageProps {
  params: {
    slug: string
  }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = projectsData.find(p => p.id === params.slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center text-gray-600 mb-4">
            <a href="/projekte" className="hover:text-black transition-colors">
              Projekte
            </a>
            <span className="mx-2">→</span>
            <span>{project.name}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
                {project.name}
              </h1>
              <p className="text-xl text-gray-600">{project.location}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-4 py-2 text-lg font-medium ${
                  project.status === 'verfügbar'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ImageSlider images={project.images} projectName={project.name} />
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-black mb-4">Beschreibung</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>

            {project.floorPlan && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-black mb-4">Grundriss</h2>
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">Grundriss Platzhalter</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-black mb-6">Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Wohnfläche</span>
                  <span className="font-medium text-black">{project.details.livingSpace}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Zimmer</span>
                  <span className="font-medium text-black">{project.details.rooms}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Preis</span>
                  <span className="font-medium text-black">{project.details.price}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Fertigstellung</span>
                  <span className="font-medium text-black">{project.details.completion}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-black capitalize">{project.status}</span>
                </div>
              </div>

              <div className="mt-8">
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