export interface Project {
  id: string
  name: string
  location: string
  status: 'verfügbar' | 'verkauft'
  description: string
  priceFrom: string
  year: number
  category: 'current' | 'historical'
  images: string[]
  details: {
    livingSpace: string
    rooms: string
    price: string
    completion: string
  }
  floorPlan?: string
}