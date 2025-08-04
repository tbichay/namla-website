import type { HistoricalProject, CurrentProject } from '@/types/project'

export interface ProjectMetrics {
  totalProjects: number
  totalUnits: number
  yearsExperience: number
  currentProjectsCount: number
  completedProjectsCount: number
}

export function calculateProjectMetrics(
  historicalProjects: HistoricalProject[],
  currentProjects: CurrentProject[] = []
): ProjectMetrics {
  // Calculate total units from historical projects
  const totalUnits = historicalProjects.reduce((total, project) => {
    return total + (project.units || 0)
  }, 0)

  // Calculate years of experience from oldest project
  const oldestYear = historicalProjects.length > 0 
    ? Math.min(...historicalProjects.map(p => p.year))
    : new Date().getFullYear() - 26 // fallback to 26 years

  const yearsExperience = new Date().getFullYear() - oldestYear

  return {
    totalProjects: historicalProjects.length + currentProjects.length,
    totalUnits: totalUnits || 170, // fallback to previous estimate
    yearsExperience: yearsExperience || 26, // fallback
    currentProjectsCount: currentProjects.length,
    completedProjectsCount: historicalProjects.length
  }
}

// Format metrics for display
export function formatMetric(value: number, suffix: string = ''): string {
  if (value === 0) return `0${suffix}`
  return `${value}${suffix}`
}

export function formatMetricWithPlus(value: number, suffix: string = ''): string {
  if (value === 0) return `0${suffix}`
  return `${value}+${suffix}`
}