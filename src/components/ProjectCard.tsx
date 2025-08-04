import Link from 'next/link'
import { CurrentProject } from '@/types/project'
import { getStatusLabel, getStatusColor, formatPrice, shouldShowPrice } from '@/lib/project-display-utils'

interface ProjectCardProps {
  project: CurrentProject
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden" role="img" aria-label={`Projektbild für ${project.name}`}>
        {project.images && project.images.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-stone-400 text-sm sm:text-base">Projekt Bild</span>
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-stone-800 leading-tight">{project.name}</h3>
          <span
            className={`self-start px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium whitespace-nowrap rounded-full ${getStatusColor(project.status)}`}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>
        
        <p className="text-stone-500 mb-3 text-sm sm:text-base">{project.location}</p>
        
        <p className="text-stone-600 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
          {project.description}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          {shouldShowPrice(project.priceFrom) && (
            <p className="text-base sm:text-lg font-semibold text-stone-800">
              {formatPrice(project.priceFrom)}
            </p>
          )}
          <Link
            href={`/projekte/${project.id}`}
            className="text-amber-600 hover:text-amber-700 transition-colors font-medium text-sm sm:text-base self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-sm"
            aria-label={`Details zu ${project.name} ansehen`}
          >
            Details ansehen →
          </Link>
        </div>
      </div>
    </article>
  )
}