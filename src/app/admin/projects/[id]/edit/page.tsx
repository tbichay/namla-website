'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShadcnButton } from '@/components/ui/shadcn-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Eye, Loader2, Image, Video, Sparkles } from 'lucide-react'
import MediaUpload from '@/components/admin/MediaUpload'
import AIEnhanceModal from '@/components/admin/AIEnhanceModal'
import type { Project } from '@/lib/db'

interface ProjectFormData {
  name: string
  location: string
  address: string
  status: string
  type: string
  priceFrom: string
  description: string
  shortDescription: string
  details: {
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
  features: string[]
  locationDetails: {
    district?: string
    nearbyAmenities?: string[]
    transportation?: string[]
  }
  metaTitle: string
  metaDescription: string
  isPublished: boolean
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [enhanceModalOpen, setEnhanceModalOpen] = useState(false)
  const [selectedMediaForEnhancement, setSelectedMediaForEnhancement] = useState<UploadedMedia | null>(null)

interface UploadedMedia {
  id: string
  url: string
  filename: string
  originalName: string
  mediaType: 'image' | 'video'
  alt?: string
  caption?: string
  isMainImage: boolean
  sortOrder?: number
  createdAt?: string
}
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    location: '',
    address: '',
    status: 'in_planung',
    type: 'einfamilienhaus',
    priceFrom: '',
    description: '',
    shortDescription: '',
    details: {
      balcony: false,
      terrace: false,
      garden: false,
      basement: false,
      elevator: false
    },
    features: [],
    locationDetails: {
      nearbyAmenities: [],
      transportation: []
    },
    metaTitle: '',
    metaDescription: '',
    isPublished: false
  })

  // Fetch existing project data
  useEffect(() => {
    fetchProject()
    fetchMedia()
  }, [projectId])

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (err) {
      console.error('Error fetching media:', err)
    }
  }

  const fetchProject = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}`)
      const data = await response.json()
      
      if (response.ok) {
        const project = data.project as Project
        setFormData({
          name: project.name,
          location: project.location,
          address: project.address || '',
          status: project.status,
          type: project.type,
          priceFrom: project.priceFrom || '',
          description: project.description || '',
          shortDescription: project.shortDescription || '',
          details: project.details || {
            balcony: false,
            terrace: false,
            garden: false,
            basement: false,
            elevator: false
          },
          features: Array.isArray(project.features) ? project.features : [],
          locationDetails: project.locationDetails || {
            nearbyAmenities: [],
            transportation: []
          },
          metaTitle: project.metaTitle || '',
          metaDescription: project.metaDescription || '',
          isPublished: project.isPublished
        })
      } else {
        setError('Projekt nicht gefunden')
      }
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('Fehler beim Laden des Projekts')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }))
  }

  const handleLocationDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      locationDetails: { ...prev.locationDetails, [field]: value }
    }))
  }

  const handleArrayChange = (field: 'features' | 'nearbyAmenities' | 'transportation', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    
    if (field === 'features') {
      setFormData(prev => ({ ...prev, features: items }))
    } else {
      setFormData(prev => ({
        ...prev,
        locationDetails: { ...prev.locationDetails, [field]: items }
      }))
    }
  }

  const handleMediaUploadComplete = (newMedia: UploadedMedia[]) => {
    setMedia(prev => [...prev, ...newMedia])
  }

  const getMediaType = (filename: string): 'image' | 'video' => {
    const extension = filename.toLowerCase().split('.').pop() || ''
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv']
    return videoExtensions.includes(extension) ? 'video' : 'image'
  }

  const handleEnhanceMedia = (mediaItem: UploadedMedia) => {
    const mediaType = getMediaType(mediaItem.filename)
    if (mediaType !== 'image') {
      toast.error('Only images can be enhanced')
      return
    }
    setSelectedMediaForEnhancement(mediaItem)
    setEnhanceModalOpen(true)
  }

  const handleEnhancementComplete = (result: any) => {
    // In a real implementation, this would update the media item
    // with the enhanced URL and refresh the media list
    toast.success('Image enhancement completed!')
    fetchMedia() // Refresh the media list
  }

  const handleSubmit = async (publish: boolean = false) => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        isPublished: publish
        // Don't include publishedAt - let the service handle it
      }

      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/projects')
      } else {
        setError(data.error || 'Fehler beim Aktualisieren des Projekts')
      }
    } catch (err) {
      console.error('Error updating project:', err)
      setError('Fehler beim Aktualisieren des Projekts')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Projekt wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error && fetchLoading === false && !formData.name) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Fehler</h1>
          <p className="text-stone-600 mb-6">{error}</p>
          <Link href="/admin/projects">
            <ShadcnButton>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </ShadcnButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/projects">
              <ShadcnButton variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </ShadcnButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Projekt bearbeiten</h1>
              <p className="text-stone-600 mt-2">
                Bearbeiten Sie die Details Ihres Immobilienprojekts
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Projektname *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="z.B. Villa Zeitblom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Standort *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="z.B. Ulm-Söflingen"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Adresse
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="z.B. Zeitblomstraße 31, 89073 Ulm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Status *
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="verfügbar">Verfügbar</option>
                    <option value="verkauft">Verkauft</option>
                    <option value="in_planung">In Planung</option>
                    <option value="in_bau">In Bau</option>
                    <option value="fertiggestellt">Fertiggestellt</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Typ *
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="einfamilienhaus">Einfamilienhaus</option>
                    <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                    <option value="eigentumswohnung">Eigentumswohnung</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="villa">Villa</option>
                    <option value="reihenhaus">Reihenhaus</option>
                    <option value="doppelhaushälfte">Doppelhaushälfte</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Preis ab
                  </label>
                  <Input
                    value={formData.priceFrom}
                    onChange={(e) => handleInputChange('priceFrom', e.target.value)}
                    placeholder="z.B. 850000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Kurzbeschreibung
                </label>
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Kurze Zusammenfassung für Kartenansicht"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Detailbeschreibung
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ausführliche Beschreibung des Projekts"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Objektdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Zimmer
                  </label>
                  <Input
                    value={formData.details.rooms || ''}
                    onChange={(e) => handleDetailsChange('rooms', e.target.value)}
                    placeholder="z.B. 5 Zimmer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Schlafzimmer
                  </label>
                  <Input
                    type="number"
                    value={formData.details.bedrooms || ''}
                    onChange={(e) => handleDetailsChange('bedrooms', parseInt(e.target.value) || undefined)}
                    placeholder="z.B. 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Badezimmer
                  </label>
                  <Input
                    type="number"
                    value={formData.details.bathrooms || ''}
                    onChange={(e) => handleDetailsChange('bathrooms', parseInt(e.target.value) || undefined)}
                    placeholder="z.B. 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Wohnfläche
                  </label>
                  <Input
                    value={formData.details.livingSpace || ''}
                    onChange={(e) => handleDetailsChange('livingSpace', e.target.value)}
                    placeholder="z.B. 180 m²"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Gesamtfläche
                  </label>
                  <Input
                    value={formData.details.totalSpace || ''}
                    onChange={(e) => handleDetailsChange('totalSpace', e.target.value)}
                    placeholder="z.B. 200 m²"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Grundstücksgröße
                  </label>
                  <Input
                    value={formData.details.plotSize || ''}
                    onChange={(e) => handleDetailsChange('plotSize', e.target.value)}
                    placeholder="z.B. 800 m²"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Stockwerke
                  </label>
                  <Input
                    type="number"
                    value={formData.details.floors || ''}
                    onChange={(e) => handleDetailsChange('floors', parseInt(e.target.value) || undefined)}
                    placeholder="z.B. 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Baujahr
                  </label>
                  <Input
                    type="number"
                    value={formData.details.buildYear || ''}
                    onChange={(e) => handleDetailsChange('buildYear', parseInt(e.target.value) || undefined)}
                    placeholder="z.B. 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Energieklasse
                  </label>
                  <Input
                    value={formData.details.energyClass || ''}
                    onChange={(e) => handleDetailsChange('energyClass', e.target.value)}
                    placeholder="z.B. A+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Heizungsart
                  </label>
                  <Input
                    value={formData.details.heatingType || ''}
                    onChange={(e) => handleDetailsChange('heatingType', e.target.value)}
                    placeholder="z.B. Wärmepumpe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Parkmöglichkeiten
                </label>
                <Input
                  value={formData.details.parking || ''}
                  onChange={(e) => handleDetailsChange('parking', e.target.value)}
                  placeholder="z.B. 2 Stellplätze"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: 'balcony', label: 'Balkon' },
                  { key: 'terrace', label: 'Terrasse' },
                  { key: 'garden', label: 'Garten' },
                  { key: 'basement', label: 'Keller' },
                  { key: 'elevator', label: 'Aufzug' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={formData.details[key as keyof typeof formData.details] as boolean}
                      onChange={(e) => handleDetailsChange(key, e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor={key} className="text-sm text-stone-700">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ausstattung & Lage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Ausstattungsmerkmale
                </label>
                <Input
                  value={formData.features.join(', ')}
                  onChange={(e) => handleArrayChange('features', e.target.value)}
                  placeholder="z.B. Moderne Küche, Großer Garten, Smart Home (kommagetrennt)"
                />
                <p className="text-xs text-stone-500 mt-1">Merkmale durch Kommas trennen</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Stadtteil
                </label>
                <Input
                  value={formData.locationDetails.district || ''}
                  onChange={(e) => handleLocationDetailsChange('district', e.target.value)}
                  placeholder="z.B. Söflingen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Nahegelegene Einrichtungen
                </label>
                <Input
                  value={formData.locationDetails.nearbyAmenities?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('nearbyAmenities', e.target.value)}
                  placeholder="z.B. Grundschule, Kindergarten, Einkaufszentrum (kommagetrennt)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Verkehrsanbindung
                </label>
                <Input
                  value={formData.locationDetails.transportation?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('transportation', e.target.value)}
                  placeholder="z.B. Bushaltestelle (2 Min.), S-Bahn (10 Min.) (kommagetrennt)"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Meta-Titel
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="z.B. Villa Zeitblom - Exklusive Villa in Ulm-Söflingen | NAMLA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Meta-Beschreibung
                </label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="z.B. Exklusive Villa in ruhiger Lage mit großzügigem Garten..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Medien verwalten
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Existing Media Overview */}
              {media.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Vorhandene Medien ({media.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {media.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          {getMediaType(item.filename) === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.alt || 'Project media'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                          )}
                          
                          {/* Enhancement Button - Only for images */}
                          {getMediaType(item.filename) === 'image' && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center">
                              <button
                                onClick={() => handleEnhanceMedia(item)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg"
                                title="Enhance with AI"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {item.isMainImage && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Component */}
              <MediaUpload
                projectId={projectId}
                onUploadComplete={handleMediaUploadComplete}
                existingMedia={media}
                maxFiles={20}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-3">
                  <ShadcnButton
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !formData.name || !formData.location}
                    variant="outline"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Als Entwurf speichern
                  </ShadcnButton>
                  
                  <ShadcnButton
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !formData.name || !formData.location}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    Speichern & Veröffentlichen
                  </ShadcnButton>
                </div>

                <div className="text-xs text-stone-500">
                  * Pflichtfelder
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Enhancement Modal */}
      <AIEnhanceModal
        isOpen={enhanceModalOpen}
        onClose={() => setEnhanceModalOpen(false)}
        projectId={projectId}
        mediaId={selectedMediaForEnhancement?.id || ''}
        mediaUrl={selectedMediaForEnhancement?.url || ''}
        onEnhancementComplete={handleEnhancementComplete}
      />
    </div>
  )
}