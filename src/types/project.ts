// Base project interface
interface BaseProject {
  id: string
  name: string
  location: string
  year: number
  images: string[]
}

// Current projects with full details
export interface CurrentProject extends BaseProject {
  category: 'current'
  status: 'verfügbar' | 'verkauft'
  description: string
  priceFrom: string
  details: {
    livingSpace: string
    rooms: string
    price: string
    completion: string
  }
  floorPlan?: string
}

// Historical projects with minimal info
export interface HistoricalProject extends BaseProject {
  category: 'historical'
  units: number // Simple unit count instead of detailed specs
}

// Union type for all projects
export type Project = CurrentProject | HistoricalProject

// Type guards
export function isCurrentProject(project: Project): project is CurrentProject {
  return project.category === 'current'
}

export function isHistoricalProject(project: Project): project is HistoricalProject {
  return project.category === 'historical'
}