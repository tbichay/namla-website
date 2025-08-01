'use client'

import Link from 'next/link'
import { ShadcnButton } from '@/components/ui/shadcn-button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-stone-200">404</h1>
          <div className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
            Seite nicht gefunden
          </div>
          <p className="text-stone-600 mb-8 max-w-md mx-auto">
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <ShadcnButton>
              <Home className="mr-2 h-4 w-4" />
              Zur Startseite
            </ShadcnButton>
          </Link>
          <ShadcnButton 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </ShadcnButton>
        </div>
      </div>
    </div>
  )
}