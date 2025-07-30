import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header - Mobile First */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4 sm:mb-6 px-4">
            Über NAMLA
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-xl lg:max-w-2xl mx-auto px-4 leading-relaxed">
            Architektur und Bauträger aus einer Hand – seit über 50 Jahren Ihr Partner 
            für hochwertige Wohnimmobilien in der Region Ulm.
          </p>
        </div>

        {/* Business Story Section */}
        <section className="bg-white rounded-lg shadow-sm p-8 sm:p-12 mb-12 sm:mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="inline-block bg-amber-100 px-4 py-2 rounded-full mb-4">
                <span className="text-amber-800 font-medium text-sm tracking-wide uppercase">Seit 1974</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-6">
                Kompetenz und Erfahrung im Bauwesen
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 text-stone-600 leading-relaxed">
                <p className="text-lg">
                  <strong className="text-stone-800">NAMLA vereint Architektur und Bauträger unter einem Dach.</strong> 
                  Diese einzigartige Kombination ermöglicht es uns, Ihre Wohnträume von der ersten Idee bis zur 
                  Schlüsselübergabe professionell zu begleiten.
                </p>
                <p>
                  Mit über 50 Jahren Erfahrung im Bauwesen haben wir uns auf hochwertige Wohnimmobilien 
                  spezialisiert. Unser Team aus qualifizierten Architekten und erfahrenen Projektentwicklern 
                  realisiert anspruchsvolle Bauprojekte, die durch Qualität, Nachhaltigkeit und 
                  durchdachte Grundrisse überzeugen.
                </p>
                <p>
                  Als regional verwurzeltes Unternehmen kennen wir die Bedürfnisse unserer Kunden und die 
                  Besonderheiten des lokalen Immobilienmarktes. Jedes Projekt wird individuell geplant und 
                  mit höchster Sorgfalt umgesetzt – für Wohnraum, der Werte schafft und Bestand hat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Competencies Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
              Unsere Kernkompetenzen
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Von der Projektentwicklung bis zur Fertigstellung – wir bieten alle Leistungen 
              aus einer Hand für Ihren Erfolg.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Architektur</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Moderne Entwürfe, die Funktionalität und Ästhetik perfekt vereinen. 
                Vom Einfamilienhaus bis zum Mehrfamilienhaus.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V7a2 2 0 00-2-2H16M9 5a2 2 0 012 2v12M9 5a2 2 0 00-2 2v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Projektentwicklung</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Professionelle Planung und Koordination aller Projektphasen. 
                Termine, Budgets und Qualität im Blick.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Bauträger</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Komplette Baubetreuung von Grundstück bis Schlüsselübergabe. 
                Zuverlässig, termintreu, qualitätsbewusst.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-stone-100 rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
            Lassen Sie uns Ihr nächstes Projekt gemeinsam realisieren
          </h2>
          <p className="text-stone-600 mb-8 max-w-2xl mx-auto">
            Über 50 Jahre Erfahrung, hunderte realisierte Projekte und die Kompetenz 
            von Architekten und Bauträgern – das ist Ihr Vorteil bei NAMLA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projekte" className="inline-block px-8 py-3 bg-stone-800 text-white hover:bg-stone-700 transition-colors rounded-sm font-medium">
              Unsere Projekte ansehen
            </Link>
            <Link href="/kontakt" className="inline-block px-8 py-3 border border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-colors rounded-sm font-medium">
              Beratungstermin vereinbaren
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}