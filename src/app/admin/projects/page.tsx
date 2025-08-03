'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShadcnButton } from '@/components/ui/shadcn-button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Building2,
  MapPin,
  Euro,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Project } from '@/lib/db'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [togglingProjects, setTogglingProjects] = useState<Set<string>>(new Set())
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set())
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    projectId: string | null
    projectName: string | null
  }>({
    isOpen: false,
    projectId: null,
    projectName: null
  })

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, publishedFilter])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteModal.isOpen) {
        closeDeleteModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [deleteModal.isOpen])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(publishedFilter && { published: publishedFilter })
      })
      
      const response = await fetch(`/api/admin/projects?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects || [])
      } else {
        toast.error('Fehler beim Laden der Projekte')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Fehler beim Laden der Projekte')
    } finally {
      setLoading(false)
    }
  }

  const toggleProjectStatus = async (projectId: string) => {
    // Find the project
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    // Add to toggling set
    setTogglingProjects(prev => new Set(prev).add(projectId))

    // Optimistic update
    const newStatus = !project.isPublished
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, isPublished: newStatus, publishedAt: newStatus ? new Date() : null }
        : p
    ))

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/toggle`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`Projekt ${newStatus ? 'veröffentlicht' : 'versteckt'}`)
        
        // Update with server response
        setProjects(prev => prev.map(p => 
          p.id === projectId ? data.project : p
        ))
      } else {
        // Revert optimistic update
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, isPublished: project.isPublished, publishedAt: project.publishedAt }
            : p
        ))
        toast.error('Fehler beim Ändern der Sichtbarkeit')
      }
    } catch (error) {
      // Revert optimistic update
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, isPublished: project.isPublished, publishedAt: project.publishedAt }
          : p
      ))
      console.error('Error toggling project status:', error)
      toast.error('Fehler beim Ändern der Sichtbarkeit')
    } finally {
      // Remove from toggling set
      setTogglingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const openDeleteModal = (projectId: string, projectName: string) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectName
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      projectId: null,
      projectName: null
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.projectId || !deleteModal.projectName) return
    
    const projectId = deleteModal.projectId
    const projectName = deleteModal.projectName
    
    // Close modal first
    closeDeleteModal()

    // Add to deleting set
    setDeletingProjects(prev => new Set(prev).add(projectId))

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from local state
        setProjects(prev => prev.filter(p => p.id !== projectId))
        toast.success(`Projekt "${projectName}" wurde gelöscht`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Löschen des Projekts')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Fehler beim Löschen des Projekts')
    } finally {
      // Remove from deleting set
      setDeletingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.location.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      'verfügbar': 'success',
      'verkauft': 'secondary',
      'in_planung': 'warning',
      'in_bau': 'default',
      'fertiggestellt': 'outline'
    } as const
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-stone-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-stone-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Projekte</h1>
          <p className="text-stone-600 mt-1 sm:mt-2">
            Verwalten Sie Ihre Immobilienprojekte
          </p>
        </div>
        <Link href="/admin/projects/new" className="self-start sm:self-auto">
          <ShadcnButton className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="sm:inline">Neues Projekt</span>
          </ShadcnButton>
        </Link>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            >
              <option value="">Alle Status</option>
              <option value="verfügbar">Verfügbar</option>
              <option value="verkauft">Verkauft</option>
              <option value="in_planung">In Planung</option>
              <option value="in_bau">In Bau</option>
              <option value="fertiggestellt">Fertiggestellt</option>
            </Select>
            <Select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="w-full"
            >
              <option value="">Alle Projekte</option>
              <option value="true">Veröffentlicht</option>
              <option value="false">Entwürfe</option>
            </Select>
            <ShadcnButton 
              variant="outline" 
              onClick={fetchProjects}
              className="w-full sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              <span className="sm:inline">Aktualisieren</span>
            </ShadcnButton>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-stone-400 mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">
                Keine Projekte gefunden
              </h3>
              <p className="text-stone-600 mb-4">
                {search || statusFilter || publishedFilter 
                  ? 'Keine Projekte entsprechen Ihren Filterkriterien.'
                  : 'Beginnen Sie mit der Erstellung Ihres ersten Projekts.'
                }
              </p>
              {!search && !statusFilter && !publishedFilter && (
                <Link href="/admin/projects/new">
                  <ShadcnButton>
                    <Plus className="mr-2 h-4 w-4" />
                    Erstes Projekt erstellen
                  </ShadcnButton>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4 sm:p-6">
                {/* Mobile-First Layout */}
                <div className="space-y-3">
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-stone-900 break-words leading-tight">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getStatusBadge(project.status)}
                      {!project.isPublished && (
                        <Badge variant="outline" className="text-xs">Entwurf</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Location, Price, and Type - Mobile Stacked */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words">{project.location}</span>
                    </div>
                    {project.priceFrom && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Euro className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">
                          {project.priceFrom === '---' ? 'Verkauft' : `ab ${project.priceFrom}`}
                        </span>
                      </div>
                    )}
                    <div className="text-xs bg-stone-100 px-2 py-1 rounded-full self-start">
                      {project.type}
                    </div>
                  </div>

                  {/* Description */}
                  {project.shortDescription && (
                    <p className="text-sm text-stone-600 line-clamp-2 break-words">
                      {project.shortDescription}
                    </p>
                  )}

                  {/* Bottom Row: Dates and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-500 break-words">
                      Erstellt: {new Date(project.createdAt).toLocaleDateString('de-DE')}
                      {project.updatedAt !== project.createdAt && (
                        <span className="block sm:inline">
                          <span className="hidden sm:inline"> • </span>
                          Aktualisiert: {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex items-center gap-1 justify-end">
                      <ShadcnButton
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProjectStatus(project.id)}
                        title={project.isPublished ? 'Verstecken' : 'Veröffentlichen'}
                        disabled={togglingProjects.has(project.id)}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                      >
                        {togglingProjects.has(project.id) ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : project.isPublished ? (
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </ShadcnButton>
                      
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <ShadcnButton 
                          variant="ghost" 
                          size="sm" 
                          title="Bearbeiten"
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </ShadcnButton>
                      </Link>
                      
                      <ShadcnButton
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(project.id, project.name)}
                        title="Löschen"
                        disabled={deletingProjects.has(project.id)}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                      >
                        {deletingProjects.has(project.id) ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        )}
                      </ShadcnButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredProjects.length > 0 && (
        <div className="text-center text-sm text-stone-500">
          {filteredProjects.length} von {projects.length} Projekten angezeigt
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  Projekt löschen
                </h3>
                <p className="text-sm text-stone-600 mb-6">
                  Sind Sie sicher, dass Sie das Projekt{' '}
                  <span className="font-semibold">"{deleteModal.projectName}"</span>{' '}
                  permanent löschen möchten?
                </p>
                <p className="text-xs text-red-600 mb-6">
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <ShadcnButton
                  variant="outline"
                  onClick={closeDeleteModal}
                >
                  Abbrechen
                </ShadcnButton>
                <ShadcnButton
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Löschen
                </ShadcnButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}