import Link from 'next/link'

interface Project {
  id: string
  name: string
  location: string
  status: 'verfügbar' | 'verkauft'
  description: string
  priceFrom: string
  images: string[]
}

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Projekt Bild</span>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-black">{project.name}</h3>
          <span
            className={`px-3 py-1 text-sm font-medium ${
              project.status === 'verfügbar'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {project.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3">{project.location}</p>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {project.description}
        </p>
        
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">
            ab {parseInt(project.priceFrom).toLocaleString('de-DE')} €
          </p>
          <Link
            href={`/projekte/${project.id}`}
            className="text-black hover:text-gray-600 transition-colors font-medium"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  )
}