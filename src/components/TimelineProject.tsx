import Link from 'next/link'
import { Project } from '@/types/project'

interface TimelineProjectProps {
  project: Project
  index: number
  total: number
}

export default function TimelineProject({ project, index, total }: TimelineProjectProps) {
  // Calculate opacity based on age (newer = more vibrant, older = more muted)
  const ageRatio = index / (total - 1) // 0 = newest, 1 = oldest
  const opacity = 1 - (ageRatio * 0.3) // Range from 1.0 to 0.7
  const saturation = 100 - (ageRatio * 30) // Range from 100% to 70%

  return (
    <div className="flex-shrink-0 w-48 group cursor-pointer relative">
      <Link href={`/projekte/${project.id}`}>
        {/* Project Image */}
        <div 
          className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-300"
          style={{ 
            opacity,
            filter: `saturate(${saturation}%)` 
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <div className="text-center text-stone-500">
              <div className="text-xs mb-1">Projekt {project.year}</div>
              <div className="text-2xl font-bold">{project.year}</div>
            </div>
          </div>
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Project Info */}
        <div className="text-center">
          {/* Year Badge */}
          <div 
            className="inline-block px-3 py-1 bg-stone-800 text-white text-xs font-bold rounded-full mb-2"
            style={{ opacity }}
          >
            {project.year}
          </div>
          
          {/* Project Name */}
          <h3 className="font-semibold text-stone-800 text-sm leading-tight mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
            {project.name}
          </h3>
          
          {/* Location */}
          <p className="text-xs text-stone-500 mb-2">{project.location}</p>
          
          {/* Key Metric */}
          <div className="flex justify-center">
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
              {project.details.rooms}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}