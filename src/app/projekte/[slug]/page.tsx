'use client'

import { notFound } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MediaGallery from '@/components/MediaGallery'
import Button from '@/components/ui/Button'

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

interface ProjectDetails {
  rooms?: string
  bedrooms?: number
  bathrooms?: number
  livingSpace?: string
  totalSpace?: string
  plotSize?: string
  floors?: number
  buildYear?: number
  energyClass?: string
  heatingType?: string
  parking?: string
  balcony?: boolean
  terrace?: boolean
  garden?: boolean
  basement?: boolean
  elevator?: boolean
}

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  alt?: string
  caption?: string
  isMainImage: boolean
  sortOrder: number
}

interface ProjectData {
  id: string
  name: string
  slug: string
  location: string
  address?: string
  status: 'verfügbar' | 'verkauft' | 'in_planung' | 'in_bau' | 'fertiggestellt'
  type: string
  priceFrom?: string
  priceExact?: number
  description?: string
  shortDescription?: string
  details?: ProjectDetails
  media: MediaItem[]
  features?: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'
  const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Redirect public users to coming soon page
  useEffect(() => {
    if (comingSoonMode && !isAdmin) {
      router.push('/')
    }
  }, [comingSoonMode, isAdmin, router])

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${slug}`)
        if (response.status === 404) {
          notFound()
        }
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }
        const data = await response.json()
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug])

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded mb-4 w-1/3"></div>
            <div className="h-12 bg-stone-200 rounded mb-6 w-2/3"></div>
            <div className="aspect-[16/9] bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    notFound()
  }

  const isCurrentProject = (project: ProjectData) => 
    project.status === 'verfügbar' || project.status === 'verkauft'
  
  const isHistoricalProject = (project: ProjectData) => 
    project.status === 'fertiggestellt'

  // Sort media by sortOrder and isMainImage
  const sortedMedia = project.media
    .sort((a, b) => {
      if (a.isMainImage && !b.isMainImage) return -1
      if (!a.isMainImage && b.isMainImage) return 1
      return Number(a.sortOrder) - Number(b.sortOrder)
    })

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb & Header - Mobile First */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-stone-500 mb-4 text-sm sm:text-base px-2 sm:px-0">
            <Link href="/projekte" className="hover:text-stone-800 transition-colors">
              Projekte
            </Link>
            <span className="mx-2">→</span>
            <span className="truncate">{project.name}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
            <div className="px-2 sm:px-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-2 leading-tight">
                {project.name}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-stone-600">{project.location}</p>
              {project.details?.buildYear && (
                <p className="text-sm text-stone-500 mt-1">Fertigstellung: {project.details.buildYear}</p>
              )}
            </div>
            <div className="px-2 sm:px-0">
              {isCurrentProject(project) && (
                <span
                  className={`inline-block px-3 sm:px-4 py-2 text-sm sm:text-base lg:text-lg font-medium rounded-full ${
                    project.status === 'verfügbar'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {project.status}
                </span>
              )}
              {isHistoricalProject(project) && (
                <span className="inline-block px-3 sm:px-4 py-2 text-sm sm:text-base lg:text-lg font-medium rounded-full bg-stone-100 text-stone-600">
                  Fertiggestellt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <MediaGallery items={sortedMedia} projectName={project.name} />
            
            {/* Project Description */}
            {project.description && (
              <div className="mt-6 sm:mt-8 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">Beschreibung</h2>
                <div className="text-stone-600 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
            )}

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="mt-6 sm:mt-8 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">Ausstattung</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-stone-600 text-sm sm:text-base">
                      <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Project Note */}
            {isHistoricalProject(project) && (
              <div className="mt-6 sm:mt-8 px-2 sm:px-0">
                <div className="text-center p-6 bg-stone-100 rounded-lg">
                  <p className="text-stone-600 text-sm">
                    Dieses Projekt wurde erfolgreich realisiert und ist Teil unserer 
                    umfangreichen Bauerfahrung in der Region Ulm.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4 sm:mb-6">
                {isCurrentProject(project) ? 'Details' : 'Projektinfo'}
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Type */}
                <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                  <span className="text-stone-500">Typ</span>
                  <span className="font-medium text-stone-800 capitalize">{project.type.replace('_', ' ')}</span>
                </div>

                {/* Living Space */}
                {project.details?.livingSpace && (
                  <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                    <span className="text-stone-500">Wohnfläche</span>
                    <span className="font-medium text-stone-800">{project.details.livingSpace}</span>
                  </div>
                )}

                {/* Rooms */}
                {project.details?.rooms && (
                  <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                    <span className="text-stone-500">Zimmer</span>
                    <span className="font-medium text-stone-800">{project.details.rooms}</span>
                  </div>
                )}

                {/* Price */}
                {(project.priceFrom || project.priceExact) && (
                  <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                    <span className="text-stone-500">Preis</span>
                    <span className="font-medium text-stone-800">
                      {project.priceExact 
                        ? `€ ${Number(project.priceExact).toLocaleString('de-DE')}`
                        : project.priceFrom
                      }
                    </span>
                  </div>
                )}

                {/* Plot Size */}
                {project.details?.plotSize && (
                  <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                    <span className="text-stone-500">Grundstück</span>
                    <span className="font-medium text-stone-800">{project.details.plotSize}</span>
                  </div>
                )}

                {/* Energy Class */}
                {project.details?.energyClass && (
                  <div className="flex justify-between py-2 border-b border-stone-200 text-sm sm:text-base">
                    <span className="text-stone-500">Energieklasse</span>
                    <span className="font-medium text-stone-800">{project.details.energyClass}</span>
                  </div>
                )}

                {/* Status */}
                <div className="flex justify-between py-2 text-sm sm:text-base">
                  <span className="text-stone-500">Status</span>
                  <span className="font-medium text-stone-800 capitalize">{project.status}</span>
                </div>
              </div>

              {/* Contact Button for Current Projects */}
              {isCurrentProject(project) && (
                <div className="mt-6 sm:mt-8">
                  <Button href="/kontakt" className="w-full text-center">
                    Jetzt anfragen
                  </Button>
                </div>
              )}

              {/* Historical Project Note */}
              {isHistoricalProject(project) && (
                <div className="mt-6 sm:mt-8 p-4 bg-stone-50 rounded-lg">
                  <p className="text-sm text-stone-600 text-center">
                    Teil unserer erfolgreichen Projektgeschichte seit 1998.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}