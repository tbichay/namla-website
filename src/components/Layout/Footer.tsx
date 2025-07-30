import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Footer Content - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png?v=2"
                alt="NAMLA Logo"
                width={120}
                height={50}
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              Familiengeführtes Bauträgerunternehmen für hochwertige Architektur 
              und nachhaltigen Wohnraum.
            </p>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-medium text-stone-800 mb-3 sm:mb-4">Kontakt</h4>
            <div className="space-y-1 sm:space-y-2 text-stone-600 text-sm sm:text-base">
              <p>NAMLA GmbH</p>
              <p>Zeitblomstr. 31/2</p>
              <p>89073 Ulm</p>
              <p><a href="mailto:info@namla.de" className="hover:text-stone-800 transition-colors">info@namla.de</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-medium text-stone-800 mb-3 sm:mb-4">Links</h4>
            <div className="space-y-1 sm:space-y-2">
              <a href="/impressum" className="block text-stone-600 hover:text-stone-800 transition-colors text-sm sm:text-base">
                Impressum
              </a>
              <a href="/datenschutz" className="block text-stone-600 hover:text-stone-800 transition-colors text-sm sm:text-base">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright - Mobile First */}
        <div className="border-t border-stone-200 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-stone-500">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} NAMLA GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  )
}