import Link from 'next/link'
import { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center">
        <span className="text-stone-400 text-sm sm:text-base">Projekt Bild</span>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-stone-800 leading-tight">{project.name}</h3>
          <span
            className={`self-start px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium whitespace-nowrap rounded-full ${
              project.status === 'verfügbar'
                ? 'bg-green-100 text-green-800'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {project.status}
          </span>
        </div>
        
        <p className="text-stone-500 mb-3 text-sm sm:text-base">{project.location}</p>
        
        <p className="text-stone-600 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
          {project.description}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <p className="text-base sm:text-lg font-semibold text-stone-800">
            {project.priceFrom === '---' ? 'Verkauft' : `ab ${parseInt(project.priceFrom).toLocaleString('de-DE')} €`}
          </p>
          <Link
            href={`/projekte/${project.id}`}
            className="text-amber-600 hover:text-amber-700 transition-colors font-medium text-sm sm:text-base self-start sm:self-auto"
          >
            Details ansehen →
          </Link>
        </div>
      </div>
    </div>
  )
}