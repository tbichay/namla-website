import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="mb-12">
            <div className="w-full h-96 bg-gray-100 mb-8 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Hero Bild Platzhalter</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Zukunft bauen.<br />
            Wohnraum gestalten.
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Als familiengeführtes Bauträgerunternehmen schaffen wir hochwertigen Wohnraum 
            mit architektonischem Anspruch und nachhaltiger Qualität.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button href="/projekte?filter=verfuegbar">
              Aktuelle Projekte ansehen
            </Button>
            <Button href="/projekte?filter=verkauft" variant="secondary">
              Verkaufte Objekte entdecken
            </Button>
          </div>
        </div>
      </section>
      
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-4">Qualität</h3>
              <p className="text-gray-600 leading-relaxed">
                Hochwertige Materialien und durchdachte Grundrisse für 
                nachhaltigen Wohnkomfort.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-4">Erfahrung</h3>
              <p className="text-gray-600 leading-relaxed">
                Über 20 Jahre Expertise im Bereich hochwertiger 
                Wohnimmobilien und Architektur.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-4">Vertrauen</h3>
              <p className="text-gray-600 leading-relaxed">
                Familiengeführt und regional verwurzelt – Ihr verlässlicher 
                Partner für Immobilien.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
