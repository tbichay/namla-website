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
import { ArrowLeft, Save, Eye, Loader2, Image, Video, Trash2, Edit3, X, Wand2, GripVertical, FileText } from 'lucide-react'
import MediaUpload from '@/components/admin/MediaUpload'
import DocumentUpload from '@/components/admin/DocumentUpload'
import ImageEditorModal from '@/components/admin/ImageEditorModal'
import VideoCompressionModal from '@/components/admin/VideoCompressionModal'
import VideoPlayer from '@/components/ui/VideoPlayer'
import RequestDebugger from '@/components/debug/RequestDebugger'
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
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState<UploadedMedia | null>(null)
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<UploadedDocument | null>(null)
  const [documentEditModalOpen, setDocumentEditModalOpen] = useState(false)
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<UploadedMedia | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // New Image Editor state
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [selectedMediaForImageEditor, setSelectedMediaForImageEditor] = useState<UploadedMedia | null>(null)
  
  // Video Compression state
  const [videoCompressionOpen, setVideoCompressionOpen] = useState(false)
  const [selectedMediaForCompression, setSelectedMediaForCompression] = useState<UploadedMedia | null>(null)

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

interface UploadedDocument {
  id: string
  url: string
  filename: string
  originalName: string
  displayName: string
  description?: string
  fileType: string
  fileSize: number
  isDownloadable: boolean
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
    fetchDocuments()
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
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

  const handleDocumentUploadComplete = (newDocuments: UploadedDocument[]) => {
    setDocuments(prev => [...prev, ...newDocuments])
  }

  const handleDeleteDocument = async (documentItem: UploadedDocument) => {
    if (!confirm(`Are you sure you want to delete "${documentItem.displayName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/documents/${documentItem.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete document')
      }

      // Remove from local state
      setDocuments(prev => prev.filter(item => item.id !== documentItem.id))
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete document')
    }
  }

  const handleEditDocument = (documentItem: UploadedDocument) => {
    setSelectedDocumentForEdit(documentItem)
    setDocumentEditModalOpen(true)
  }

  const handleUpdateDocument = async (updatedData: Partial<UploadedDocument>) => {
    if (!selectedDocumentForEdit) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/documents/${selectedDocumentForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update document')
      }

      const result = await response.json()
      
      // Update local state
      setDocuments(prev => prev.map(item => 
        item.id === selectedDocumentForEdit.id 
          ? { ...item, ...result.document }
          : item
      ))
      
      setDocumentEditModalOpen(false)
      setSelectedDocumentForEdit(null)
      toast.success('Document updated successfully')
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update document')
    }
  }

  const getMediaType = (filename: string): 'image' | 'video' => {
    const extension = filename.toLowerCase().split('.').pop() || ''
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv']
    return videoExtensions.includes(extension) ? 'video' : 'image'
  }

  const getDocumentIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />
      case 'word':
        return <FileText className="w-8 h-8 text-blue-600" />
      case 'excel':
        return <FileText className="w-8 h-8 text-green-600" />
      case 'powerpoint':
        return <FileText className="w-8 h-8 text-orange-600" />
      default:
        return <FileText className="w-8 h-8 text-gray-600" />
    }
  }


  const handleDeleteMedia = async (mediaItem: UploadedMedia) => {
    if (!confirm(`Are you sure you want to delete "${mediaItem.originalName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media/${mediaItem.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete media')
      }

      // Remove from local state
      setMedia(prev => prev.filter(item => item.id !== mediaItem.id))
      toast.success('Media deleted successfully')
    } catch (error) {
      console.error('Error deleting media:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete media')
    }
  }

  const handleEditMedia = (mediaItem: UploadedMedia) => {
    setSelectedMediaForEdit(mediaItem)
    setEditModalOpen(true)
  }

  const handleOpenImageEditor = (mediaItem: UploadedMedia) => {
    const mediaType = getMediaType(mediaItem.filename)
    if (mediaType !== 'image') {
      toast.error('Image editor only supports images')
      return
    }
    setSelectedMediaForImageEditor(mediaItem)
    setImageEditorOpen(true)
  }

  const handleOpenVideoCompression = (mediaItem: UploadedMedia) => {
    const mediaType = getMediaType(mediaItem.filename)
    if (mediaType !== 'video') {
      toast.error('Video compression only supports videos')
      return
    }
    setSelectedMediaForCompression(mediaItem)
    setVideoCompressionOpen(true)
  }

  const handleUpdateMedia = async (updatedData: Partial<UploadedMedia>) => {
    if (!selectedMediaForEdit) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media/${selectedMediaForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update media')
      }

      const result = await response.json()
      
      // Update local state
      setMedia(prev => prev.map(item => 
        item.id === selectedMediaForEdit.id 
          ? { ...item, ...result.media }
          : item
      ))
      
      setEditModalOpen(false)
      setSelectedMediaForEdit(null)
      toast.success('Media updated successfully')
    } catch (error) {
      console.error('Error updating media:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update media')
    }
  }



  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: UploadedMedia, index: number) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    
    // Add visual feedback to the dragged element
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    setDragOverIndex(null)
    
    // Reset visual feedback
    const target = e.target as HTMLElement
    target.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove drag over state if we're leaving the container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem) return
    
    const sourceIndex = media.findIndex(item => item.id === draggedItem.id)
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDragOverIndex(null)
      return
    }

    // Optimistically update the local state
    const newMedia = [...media]
    const [removed] = newMedia.splice(sourceIndex, 1)
    newMedia.splice(targetIndex, 0, removed)
    
    // Update sortOrder for all affected items
    const updatedMedia = newMedia.map((item, index) => ({
      ...item,
      sortOrder: index
    }))
    
    setMedia(updatedMedia)
    setDragOverIndex(null)

    // Update the backend
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: draggedItem.id,
          newPosition: targetIndex
        }),
      })

      if (!response.ok) {
        // Revert on error
        fetchMedia()
        const error = await response.json()
        throw new Error(error.error || 'Failed to reorder media')
      }

      toast.success('Media reordered successfully')
    } catch (error) {
      console.error('Error reordering media:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reorder media')
      // Refresh media to get correct order from server
      fetchMedia()
    }
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
      <RequestDebugger />
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Vorhandene Medien ({media.length})
                      </h4>
                      {media.length > 1 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <GripVertical className="w-3 h-3 inline mr-1" />
                          Drag to reorder
                        </span>
                      )}
                    </div>
                    
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {media.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="relative group"
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, item, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {/* Drag Handle */}
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-black/50 rounded p-1 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        {/* Drop indicator */}
                        {dragOverIndex === index && draggedItem && draggedItem.id !== item.id && (
                          <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50/50 z-10 pointer-events-none" />
                        )}
                        
                        <div 
                          className={`aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
                            draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          {getMediaType(item.filename) === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.alt || 'Project media'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <VideoPlayer
                              src={item.url}
                              className="w-full h-full"
                              controls={false}
                              muted
                              preload="metadata"
                            />
                          )}
                          
                          {/* Action Buttons */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditMedia(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                              title="Edit metadata"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            
                            {/* Image Editor Button - Only for images */}
                            {getMediaType(item.filename) === 'image' && (
                              <button
                                onClick={() => handleOpenImageEditor(item)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg"
                                title="Edit Image"
                              >
                                <Wand2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Video Compression Button - Only for videos */}
                            {getMediaType(item.filename) === 'video' && (
                              <button
                                onClick={() => handleOpenVideoCompression(item)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full shadow-lg"
                                title="Compress Video"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMedia(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                              title="Delete media"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                          {item.isMainImage && (
                            <div className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                              Main
                            </div>
                          )}
                          {(item.alt || item.caption) && (
                            <div className="bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                              Meta
                            </div>
                          )}
                        </div>
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

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dokumente
                {documents.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({documents.length})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Documents */}
              {documents.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Hochgeladene Dokumente</h4>
                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-start p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-shrink-0 mr-3">
                          {getDocumentIcon(doc.fileType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {doc.displayName}
                              </h5>
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.originalName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {doc.description && (
                                <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.isDownloadable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {doc.isDownloadable ? 'Downloadbar' : 'Privat'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {doc.fileType.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              <button
                                onClick={() => handleEditDocument(doc)}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                title="Edit document"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Component */}
              <DocumentUpload
                projectId={projectId}
                onUploadComplete={handleDocumentUploadComplete}
                existingDocuments={documents}
                maxFiles={10}
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


      {/* Metadata Edit Modal */}
      {editModalOpen && selectedMediaForEdit && (
        <MetadataEditModal
          media={selectedMediaForEdit}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedMediaForEdit(null)
          }}
          onSave={handleUpdateMedia}
          getMediaType={getMediaType}
        />
      )}

      {/* Image Editor Modal */}
      {imageEditorOpen && selectedMediaForImageEditor && (
        <ImageEditorModal
          isOpen={imageEditorOpen}
          onClose={() => {
            setImageEditorOpen(false)
            setSelectedMediaForImageEditor(null)
          }}
          projectId={projectId}
          mediaId={selectedMediaForImageEditor.id}
          mediaUrl={selectedMediaForImageEditor.url}
          mediaInfo={{
            id: selectedMediaForImageEditor.id,
            filename: selectedMediaForImageEditor.filename,
            originalName: selectedMediaForImageEditor.originalName
          }}
          onSaveComplete={() => {
            fetchMedia() // Refresh media list after saving
            setImageEditorOpen(false)
            setSelectedMediaForImageEditor(null)
          }}
        />
      )}

      {/* Video Compression Modal */}
      {videoCompressionOpen && selectedMediaForCompression && (
        <VideoCompressionModal
          isOpen={videoCompressionOpen}
          onClose={() => {
            setVideoCompressionOpen(false)
            setSelectedMediaForCompression(null)
          }}
          projectId={projectId}
          mediaId={selectedMediaForCompression.id}
          mediaUrl={selectedMediaForCompression.url}
          mediaName={selectedMediaForCompression.originalName}
          onCompressionComplete={() => {
            fetchMedia() // Refresh media list after compression
          }}
        />
      )}

      {/* Document Edit Modal */}
      {documentEditModalOpen && selectedDocumentForEdit && (
        <DocumentEditModal
          isOpen={documentEditModalOpen}
          onClose={() => {
            setDocumentEditModalOpen(false)
            setSelectedDocumentForEdit(null)
          }}
          document={selectedDocumentForEdit}
          onSave={handleUpdateDocument}
        />
      )}
    </div>
  )
}

// Metadata Edit Modal Component
interface MetadataEditModalProps {
  media: UploadedMedia
  onClose: () => void
  onSave: (data: Partial<UploadedMedia>) => void
  getMediaType: (filename: string) => 'image' | 'video'
}

function MetadataEditModal({ media, onClose, onSave, getMediaType }: MetadataEditModalProps) {
  const [formData, setFormData] = useState({
    alt: media.alt || '',
    caption: media.caption || '',
    isMainImage: media.isMainImage || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving metadata:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Media Metadata
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Preview */}
          <div className="mb-6">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {getMediaType(media.filename) === 'image' ? (
                <img
                  src={media.url}
                  alt={media.alt || 'Media preview'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Video className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {media.originalName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alt Text
              </label>
              <Input
                value={formData.alt}
                onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Describe the image for accessibility"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for screen readers and SEO
              </p>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption
              </label>
              <Textarea
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Optional caption displayed with the image"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Main Image Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isMainImage"
                checked={formData.isMainImage}
                onChange={(e) => setFormData(prev => ({ ...prev, isMainImage: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isMainImage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set as main image
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Main image is used as the project thumbnail
            </p>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ShadcnButton
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </ShadcnButton>
              <ShadcnButton
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </ShadcnButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Document Edit Modal Component
interface DocumentEditModalProps {
  isOpen: boolean
  onClose: () => void
  document: UploadedDocument
  onSave: (updates: Partial<UploadedDocument>) => void
}

function DocumentEditModal({ isOpen, onClose, document, onSave }: DocumentEditModalProps) {
  const [formData, setFormData] = useState({
    displayName: document.displayName,
    description: document.description || '',
    isDownloadable: document.isDownloadable
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Document
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Baubeschreibung"
                className="w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional information about this document"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Downloadable Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDownloadable"
                checked={formData.isDownloadable}
                onChange={(e) => setFormData(prev => ({ ...prev, isDownloadable: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isDownloadable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Make downloadable
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Downloadable documents are shown in the public project view
            </p>

            {/* File Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Original:</strong> {document.originalName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Size:</strong> {(document.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Type:</strong> {document.fileType.toUpperCase()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ShadcnButton
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </ShadcnButton>
              <ShadcnButton
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </ShadcnButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}