export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Über uns
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Familiengeführt, regional verwurzelt, architektonisch anspruchsvoll – 
            das ist NAMLA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">
              Unsere Geschichte
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Seit über zwei Jahrzehnten entwickelt NAMLA hochwertige Wohnprojekte 
                mit architektonischem Anspruch. Als familiengeführtes Unternehmen 
                stehen Qualität, Vertrauen und Nachhaltigkeit im Zentrum unseres Handelns.
              </p>
              <p>
                Unser Team aus erfahrenen Architekten, Planern und Projektentwicklern 
                schafft Wohnräume, die nicht nur funktional sind, sondern das Leben 
                ihrer Bewohner bereichern. Dabei setzen wir auf zeitlose Architektur, 
                hochwertige Materialien und durchdachte Grundrisse.
              </p>
              <p>
                Regional verwurzelt und dennoch innovativ – so entstehen bei NAMLA 
                Projekte, die Maßstäbe setzen und Werte schaffen, die über Generationen 
                Bestand haben.
              </p>
            </div>
          </div>
          
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-lg">Team Foto Platzhalter</span>
          </div>
        </div>

        <div className="bg-gray-50 py-16 -mx-6 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-black text-center mb-12">
              Unsere Werte
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Qualität</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hochwertige Materialien, präzise Handwerkskunst und durchdachte 
                  Details prägen jeden unserer Bauprojekte.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Vertrauen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transparenz, Zuverlässigkeit und partnerschaftliche Zusammenarbeit 
                  bilden das Fundament unserer Kundenbeziehungen.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Nachhaltigkeit</h3>
                <p className="text-gray-600 leading-relaxed">
                  Zukunftsorientiertes Bauen mit Verantwortung für Umwelt und 
                  kommende Generationen steht im Mittelpunkt unseres Handelns.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-black mb-6">
            Haben Sie Fragen?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Wir freuen uns auf ein persönliches Gespräch mit Ihnen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kontakt"
              className="inline-block px-8 py-3 text-lg bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Kontakt aufnehmen
            </a>
            <a
              href="/projekte"
              className="inline-block px-8 py-3 text-lg border border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              Projekte entdecken
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}