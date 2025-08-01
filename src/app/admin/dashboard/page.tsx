'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Eye, Clock, CheckCircle } from 'lucide-react'

// Mock data - will be replaced with real database queries
const mockStats = {
  totalProjects: 12,
  publishedProjects: 8,
  draftProjects: 3,
  soldProjects: 1
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const statCards = [
    {
      title: 'Projekte Gesamt',
      value: stats.totalProjects,
      description: 'Alle Projekte im System',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Veröffentlicht',
      value: stats.publishedProjects,
      description: 'Öffentlich sichtbare Projekte',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      title: 'Entwürfe',
      value: stats.draftProjects,
      description: 'Noch nicht veröffentlicht',
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      title: 'Verkauft',
      value: stats.soldProjects,
      description: 'Erfolgreich verkaufte Projekte',
      icon: CheckCircle,
      color: 'text-stone-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-stone-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-stone-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-600 mt-2">
          Übersicht über Ihre Immobilienprojekte und Website-Verwaltung
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-stone-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Häufig verwendete Verwaltungsaufgaben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/projects/new"
              className="block p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="font-medium text-stone-900">Neues Projekt erstellen</div>
              <div className="text-sm text-stone-600">Fügen Sie ein neues Immobilienprojekt hinzu</div>
            </a>
            <a
              href="/admin/projects"
              className="block p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="font-medium text-stone-900">Projekte verwalten</div>
              <div className="text-sm text-stone-600">Bearbeiten Sie bestehende Projekte</div>
            </a>
            <a
              href="/"
              target="_blank"
              className="block p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="font-medium text-stone-900">Website ansehen</div>
              <div className="text-sm text-stone-600">Besuchen Sie die öffentliche Website</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System-Status</CardTitle>
            <CardDescription>
              Aktueller Status der Website und Services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div>
                <div className="font-medium text-green-900">Website</div>
                <div className="text-sm text-green-600">Online und erreichbar</div>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div>
                <div className="font-medium text-green-900">Datenbank</div>
                <div className="text-sm text-green-600">Verbunden und aktiv</div>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div>
                <div className="font-medium text-green-900">Datei-Storage</div>
                <div className="text-sm text-green-600">Cloudflare R2 aktiv</div>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}