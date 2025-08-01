import type { Project as DbProject } from '@/lib/db'
import type { CurrentProject, HistoricalProject } from '@/types/project'

// Convert database project to frontend CurrentProject
export function dbProjectToCurrentProject(dbProject: DbProject): CurrentProject {
  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.location,
    year: dbProject.details?.buildYear || new Date(dbProject.createdAt).getFullYear(),
    images: Array.isArray(dbProject.images) ? dbProject.images : [],
    category: 'current' as const,
    status: dbProject.status === 'verkauft' ? 'verkauft' : 'verfügbar',
    description: dbProject.description || '',
    priceFrom: dbProject.priceFrom || 'Preis auf Anfrage',
    details: {
      livingSpace: dbProject.details?.livingSpace || '',
      rooms: dbProject.details?.rooms || '',
      price: dbProject.priceFrom || 'Preis auf Anfrage',
      completion: dbProject.status === 'fertiggestellt' ? 'Fertiggestellt' : 
                  dbProject.status === 'in_bau' ? 'In Bau' : 
                  dbProject.status === 'in_planung' ? 'In Planung' : 'Verfügbar'
    }
  }
}

// Convert database project to frontend HistoricalProject
export function dbProjectToHistoricalProject(dbProject: DbProject): HistoricalProject {
  // Extract unit count from details or description, fallback to 1
  let units = 1
  if (dbProject.details?.rooms) {
    const roomMatch = dbProject.details.rooms.match(/(\d+)/)
    units = roomMatch ? parseInt(roomMatch[1]) : 1
  }

  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.location,
    year: dbProject.details?.buildYear || new Date(dbProject.createdAt).getFullYear(),
    images: Array.isArray(dbProject.images) ? dbProject.images : [],
    category: 'historical' as const,
    units: units
  }
}

// Convert array of database projects to frontend format
export function adaptProjectsForPublic(dbProjects: DbProject[]) {
  const currentProjects = dbProjects
    .filter(p => p.status !== 'verkauft')
    .map(dbProjectToCurrentProject)
    
  const historicalProjects = dbProjects  
    .filter(p => p.status === 'verkauft')
    .map(dbProjectToHistoricalProject)
    .sort((a, b) => b.year - a.year) // Sort from newest to oldest

  return {
    currentProjects,
    historicalProjects
  }
}