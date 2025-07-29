export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-black mb-4">NAMLA</h3>
            <p className="text-gray-600 leading-relaxed">
              Familiengeführtes Bauträgerunternehmen für hochwertige Architektur 
              und nachhaltigen Wohnraum.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-black mb-4">Kontakt</h4>
            <div className="space-y-2 text-gray-600">
              <p>Musterstraße 123</p>
              <p>12345 Musterstadt</p>
              <p>Tel: +49 (0) 123 456789</p>
              <p>info@namla.de</p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-black mb-4">Links</h4>
            <div className="space-y-2">
              <a href="/impressum" className="block text-gray-600 hover:text-black transition-colors">
                Impressum
              </a>
              <a href="/datenschutz" className="block text-gray-600 hover:text-black transition-colors">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 NAMLA. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  )
}