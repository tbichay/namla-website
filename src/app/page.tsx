'use client'

import { useSession } from 'next-auth/react'
import Button from "@/components/ui/Button";
import CurrentProjectsCarousel from "@/components/CurrentProjectsCarousel";
import ComingSoonPage from "@/components/ComingSoonPage";

export default function Home() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Show coming soon page for public users when mode is active
  if (comingSoonMode && !isAdmin) {
    return <ComingSoonPage />
  }
  
  // Show regular homepage for admins or when coming soon mode is off
  return (
    <div className="bg-stone-50">
      {/* Hero Section - Professional Trust-Building */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-4">
              <span className="text-amber-600 font-medium text-sm sm:text-base tracking-wide uppercase">
                Seit 1974 • Familienunternehmen
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-4 sm:mb-6 leading-tight">
              Ihr vertrauter Partner<br />
              für hochwertige<br />
              <span className="text-amber-600">Wohnimmobilien</span>
            </h1>
            
            <p className="text-base sm:text-lg text-stone-600 mb-6 sm:mb-8 leading-relaxed">
              Mit über 50 Jahren Erfahrung und dem Know-how von zwei Generationen schaffen wir 
              Wohnraum, in dem Sie sich zuhause fühlen. Vertrauen Sie auf unsere Expertise 
              für Ihre wichtigste Investition.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-600 rounded-full mr-3"></div>
                <span className="text-stone-600">Über 50 Jahre Erfahrung</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-600 rounded-full mr-3"></div>
                <span className="text-stone-600">Familiengeführt</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-600 rounded-full mr-3"></div>
                <span className="text-stone-600">Regional verwurzelt</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-600 rounded-full mr-3"></div>
                <span className="text-stone-600">Schlüsselfertig</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button href="/projekte">
                Unsere Projekte ansehen
              </Button>
              <Button href="/ueber-uns" variant="secondary">
                Über unser Familienunternehmen
              </Button>
            </div>
          </div>

          {/* Current Projects Carousel */}
          <div className="order-1 lg:order-2">
            <CurrentProjectsCarousel />
          </div>
        </div>
      </section>
      
      {/* Why Choose NAMLA - Professional Competence */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-4 sm:mb-6">
              Warum NAMLA wählen?
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Über 50 Jahre Erfahrung im Bauwesen, höchste Qualitätsstandards und die Expertise 
              von Architekten und Bauträgern unter einem Dach – das ist Ihr Vorteil bei NAMLA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Architektur & Bauträger</h3>
              <p className="text-stone-600 leading-relaxed">
                Von der ersten Skizze bis zur Schlüsselübergabe – alles aus einer Hand. 
                Unsere Architekten entwickeln und realisieren Ihre Wohnträume.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Qualitätsgarantie</h3>
              <p className="text-stone-600 leading-relaxed">
                Hochwertige Materialien, präzise Handwerkskunst und strenge Qualitätskontrollen 
                garantieren nachhaltige Wertbeständigkeit Ihrer Immobilie.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Termintreue</h3>
              <p className="text-stone-600 leading-relaxed">
                Zuverlässige Projektplanung und -durchführung. Ihre neue Immobilie wird 
                pünktlich und innerhalb des vereinbarten Budgetrahmens fertiggestellt.
              </p>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-stone-50 rounded-lg p-6 sm:p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="text-amber-600 font-bold text-sm tracking-wide uppercase">Seit 1974</div>
              </div>
              <p className="text-lg text-stone-700 mb-4">
                Von 1998 bis heute haben wir erfolgreich 14 Wohnprojekte in der Region Ulm realisiert 
                und dabei über 170 Wohneinheiten geschaffen. Aktuell sind 3 Projekte verfügbar.
              </p>
              <div className="flex justify-center items-center space-x-8 text-sm text-stone-600">
                <div className="text-center">
                  <div className="font-semibold text-stone-800">26+</div>
                  <div>Jahre Erfahrung</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-stone-800">14+</div>
                  <div>Projekte realisiert</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-stone-800">3</div>
                  <div>Aktuell verfügbar</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-stone-800">170+</div>
                  <div>Wohneinheiten</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
