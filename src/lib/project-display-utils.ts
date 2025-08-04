// Helper functions for project display

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'verfügbar': 'Verfügbar',
    'verkauft': 'Verkauft',
    'in_planung': 'In Planung',
    'in_bau': 'Im Bau',
    'fertiggestellt': 'Fertiggestellt'
  }
  
  return statusLabels[status] || status
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'verfügbar': 'bg-green-100 text-green-800',
    'verkauft': 'bg-gray-100 text-gray-600',
    'in_planung': 'bg-yellow-100 text-yellow-800',
    'in_bau': 'bg-blue-100 text-blue-800',
    'fertiggestellt': 'bg-purple-100 text-purple-800'
  }
  
  return statusColors[status] || 'bg-stone-100 text-stone-600'
}

export function getStatusBadgeColor(status: string): string {
  const statusColors: Record<string, string> = {
    'verfügbar': 'bg-green-500',
    'verkauft': 'bg-gray-500',
    'in_planung': 'bg-yellow-500',
    'in_bau': 'bg-blue-500',
    'fertiggestellt': 'bg-purple-500'
  }
  
  return statusColors[status] || 'bg-stone-500'
}

export function formatPrice(priceFrom?: string | number, priceExact?: number): string | null {
  // Handle exact price first
  if (priceExact && priceExact > 0) {
    return `€ ${Number(priceExact).toLocaleString('de-DE')}`
  }
  
  // Handle priceFrom
  if (priceFrom) {
    const priceStr = String(priceFrom).trim()
    
    // Skip if it's a placeholder or empty
    if (priceStr === '---' || priceStr === '' || priceStr === '0') {
      return null
    }
    
    // Try to parse as number
    const priceNum = parseInt(priceStr.replace(/[^\d]/g, ''))
    if (priceNum && priceNum > 0) {
      return `ab €${priceNum.toLocaleString('de-DE')}`
    }
  }
  
  return null
}

export function shouldShowPrice(priceFrom?: string | number, priceExact?: number): boolean {
  return formatPrice(priceFrom, priceExact) !== null
}