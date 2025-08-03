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

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, publishedFilter])

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

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie das Projekt "${projectName}" permanent löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Projekte</h1>
          <p className="text-stone-600 mt-2">
            Verwalten Sie Ihre Immobilienprojekte
          </p>
        </div>
        <Link href="/admin/projects/new">
          <ShadcnButton>
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </ShadcnButton>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
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
            >
              <option value="">Alle Projekte</option>
              <option value="true">Veröffentlicht</option>
              <option value="false">Entwürfe</option>
            </Select>
            <ShadcnButton variant="outline" onClick={fetchProjects}>
              <Filter className="mr-2 h-4 w-4" />
              Aktualisieren
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
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-stone-900 truncate">
                        {project.name}
                      </h3>
                      {getStatusBadge(project.status)}
                      {!project.isPublished && (
                        <Badge variant="outline">Entwurf</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-stone-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                      {project.priceFrom && (
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {project.priceFrom === '---' ? 'Verkauft' : `ab ${project.priceFrom}`}
                        </div>
                      )}
                      <div className="text-xs">
                        {project.type}
                      </div>
                    </div>

                    {project.shortDescription && (
                      <p className="text-sm text-stone-600 line-clamp-2 mb-3">
                        {project.shortDescription}
                      </p>
                    )}

                    <div className="text-xs text-stone-500">
                      Erstellt: {new Date(project.createdAt).toLocaleDateString('de-DE')}
                      {project.updatedAt !== project.createdAt && (
                        <>
                          {' • '}
                          Aktualisiert: {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <ShadcnButton
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleProjectStatus(project.id)}
                      title={project.isPublished ? 'Verstecken' : 'Veröffentlichen'}
                      disabled={togglingProjects.has(project.id)}
                    >
                      {togglingProjects.has(project.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : project.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </ShadcnButton>
                    
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <ShadcnButton variant="ghost" size="icon" title="Bearbeiten">
                        <Edit className="h-4 w-4" />
                      </ShadcnButton>
                    </Link>
                    
                    <ShadcnButton
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProject(project.id, project.name)}
                      title="Löschen"
                      disabled={deletingProjects.has(project.id)}
                    >
                      {deletingProjects.has(project.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </ShadcnButton>
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
    </div>
  )
}