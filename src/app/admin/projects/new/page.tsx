'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShadcnButton } from '@/components/ui/shadcn-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Eye } from 'lucide-react'

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

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
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
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    
    if (field === 'features') {
      setFormData(prev => ({ ...prev, features: items }))
    } else {
      setFormData(prev => ({
        ...prev,
        locationDetails: { ...prev.locationDetails, [field]: items }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        isPublished: publish
        // Let the backend handle publishedAt automatically
      }

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      router.push('/admin/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/admin/projects">
          <ShadcnButton variant="ghost" size="icon" className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </ShadcnButton>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 break-words">Neues Projekt</h1>
          <p className="text-stone-600 mt-1 sm:mt-2 text-sm sm:text-base">Erstellen Sie ein neues Immobilienprojekt</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Adresse
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="z.B. Zeitblomstraße 31, 89073 Ulm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Status *
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                >
                  <option value="in_planung">In Planung</option>
                  <option value="in_bau">In Bau</option>
                  <option value="fertiggestellt">Fertiggestellt</option>
                  <option value="verfügbar">Verfügbar</option>
                  <option value="verkauft">Verkauft</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Typ *
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Preis ab
                </label>
                <Input
                  value={formData.priceFrom}
                  onChange={(e) => handleInputChange('priceFrom', e.target.value)}
                  placeholder="z.B. 850000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Kurzbeschreibung
              </label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Kurze Beschreibung für Übersichten..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Vollständige Beschreibung
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detaillierte Projektbeschreibung..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Objektdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Zimmer
                </label>
                <Input
                  value={formData.details.rooms || ''}
                  onChange={(e) => handleDetailsChange('rooms', e.target.value)}
                  placeholder="z.B. 5 Zimmer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Schlafzimmer
                </label>
                <Input
                  type="number"
                  value={formData.details.bedrooms || ''}
                  onChange={(e) => handleDetailsChange('bedrooms', parseInt(e.target.value) || undefined)}
                  placeholder="Anzahl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Badezimmer
                </label>
                <Input
                  type="number"
                  value={formData.details.bathrooms || ''}
                  onChange={(e) => handleDetailsChange('bathrooms', parseInt(e.target.value) || undefined)}
                  placeholder="Anzahl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Wohnfläche m²
                </label>
                <Input
                  value={formData.details.livingSpace || ''}
                  onChange={(e) => handleDetailsChange('livingSpace', e.target.value)}
                  placeholder="z.B. 180 m²"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Gesamtfläche m²
                </label>
                <Input
                  value={formData.details.totalSpace || ''}
                  onChange={(e) => handleDetailsChange('totalSpace', e.target.value)}
                  placeholder="z.B. 200 m²"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Grundstücksgröße m²
                </label>
                <Input
                  value={formData.details.plotSize || ''}
                  onChange={(e) => handleDetailsChange('plotSize', e.target.value)}
                  placeholder="z.B. 800 m²"
                />
              </div>
            </div>

            {/* Boolean fields */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                    checked={formData.details[key as keyof typeof formData.details] as boolean || false}
                    onChange={(e) => handleDetailsChange(key, e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <label htmlFor={key} className="text-sm text-stone-700">
                    {label}
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Ausstattungsmerkmale
              </label>
              <Input
                value={formData.features.join(', ')}
                onChange={(e) => handleArrayChange('features', e.target.value)}
                placeholder="z.B. Moderne Küche, Smart Home, Wärmepumpe"
              />
              <p className="text-xs text-stone-500 mt-1">
                Merkmale mit Komma trennen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">SEO & Meta-Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Meta-Titel
              </label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="SEO-optimierter Titel für Suchmaschinen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Meta-Beschreibung
              </label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="SEO-optimierte Beschreibung für Suchmaschinen"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Actions - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Link href="/admin/projects" className="order-3 sm:order-1">
            <ShadcnButton variant="outline" type="button" className="w-full sm:w-auto">
              Abbrechen
            </ShadcnButton>
          </Link>
          <ShadcnButton
            type="submit"
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto order-2"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Speichern...' : 'Als Entwurf speichern'}
          </ShadcnButton>
          <ShadcnButton
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            <Eye className="mr-2 h-4 w-4" />
            {loading ? 'Veröffentlichen...' : 'Veröffentlichen'}
          </ShadcnButton>
        </div>
      </form>
    </div>
  )
}