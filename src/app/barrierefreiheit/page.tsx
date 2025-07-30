export default function AccessibilityPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-8">Erklärung zur Barrierefreiheit</h1>
          
          <div className="text-stone-600 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Bemühungen um Barrierefreiheit</h2>
              <p className="text-sm leading-relaxed mb-4">
                Die NAMLA GmbH ist bemüht, ihre Website gemäß den nationalen Rechtsvorschriften zur Umsetzung 
                der Richtlinie (EU) 2016/2102 des Europäischen Parlaments barrierefrei zugänglich zu machen.
              </p>
              <p className="text-sm leading-relaxed">
                Diese Erklärung zur Barrierefreiheit gilt für die Website www.namla.de.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Stand der Vereinbarkeit mit den Anforderungen</h2>
              <p className="text-sm leading-relaxed mb-4">
                Diese Website ist mit der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0) 
                und den Web Content Accessibility Guidelines (WCAG) 2.1 auf Konformitätsstufe AA teilweise vereinbar.
              </p>
              
              <h3 className="font-semibold text-stone-800 mb-2 mt-6">Umgesetzte Barrierefreiheits-Features:</h3>
              <ul className="text-sm space-y-2 ml-4 list-disc">
                <li>Strukturierte Inhalte mit semantischen HTML-Elementen</li>
                <li>Alternative Texte für informative Bilder</li>
                <li>Keyboard-Navigation für alle interaktiven Elemente</li>
                <li>Ausreichende Farbkontraste (mindestens 4.5:1)</li>
                <li>Responsive Design für verschiedene Bildschirmgrößen</li>
                <li>Focus-Indikatoren für bessere Tastaturnavigation</li>
                <li>ARIA-Labels für Screen Reader</li>
                <li>Barrierefreies Cookie-Banner</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Nicht barrierefreie Inhalte</h2>
              <p className="text-sm leading-relaxed mb-4">
                Die nachstehend aufgeführten Inhalte sind aus folgenden Gründen nicht barrierefrei:
              </p>
              
              <h3 className="font-semibold text-stone-800 mb-2">Unvereinbarkeit mit BITV 2.0:</h3>
              <ul className="text-sm space-y-2 ml-4 list-disc mb-4">
                <li>Einige Projektbilder verfügen noch nicht über vollständige alternative Texte</li>
                <li>Die Lightbox-Galerie könnte für einige Screen Reader verbessert werden</li>
                <li>Einige interaktive Elemente könnten bessere ARIA-Beschreibungen haben</li>
              </ul>

              <p className="text-sm leading-relaxed text-stone-500">
                Diese Mängel sollen bis zum 30. Juni 2025 behoben werden.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Erstellung dieser Erklärung zur Barrierefreiheit</h2>
              <p className="text-sm leading-relaxed mb-2">
                Diese Erklärung wurde am <strong>30. Januar 2025</strong> erstellt.
              </p>
              <p className="text-sm leading-relaxed mb-2">
                Die Einschätzung basiert auf einer Selbstbewertung der Website-Betreiber.
              </p>
              <p className="text-sm leading-relaxed">
                Diese Erklärung wurde zuletzt am <strong>30. Januar 2025</strong> überprüft.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Barrieren melden: Feedback und Kontaktangaben</h2>
              <p className="text-sm leading-relaxed mb-4">
                Wenn Sie auf Barrieren stoßen oder Verbesserungsvorschläge haben, kontaktieren Sie uns gerne:
              </p>
              
              <div className="bg-stone-50 p-6 rounded-lg">
                <h3 className="font-semibold text-stone-800 mb-3">Kontakt für Barrierefreiheit</h3>
                <div className="text-sm space-y-2">
                  <p><strong>NAMLA GmbH</strong></p>
                  <p>Zeitblomstr. 31/2</p>
                  <p>89073 Ulm</p>
                  <p>
                    <strong>E-Mail:</strong>{' '}
                    <a href="mailto:barrierefreiheit@namla.de" className="text-amber-600 hover:text-amber-700 underline">
                      barrierefreiheit@namla.de
                    </a>
                  </p>
                  <p><strong>Telefon:</strong> <span className="font-mono">+49 (0) 731 123456</span></p>
                </div>
              </div>

              <p className="text-sm leading-relaxed mt-4">
                Wir sind bemüht, Ihnen innerhalb von 14 Tagen nach Eingang Ihrer Meldung zu antworten.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Durchsetzungsverfahren</h2>
              <p className="text-sm leading-relaxed mb-4">
                Wenn Sie der Ansicht sind, dass wir nicht angemessen auf Ihre Rückmeldung reagiert haben, 
                können Sie sich an die zuständige Durchsetzungsstelle wenden:
              </p>
              
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="font-semibold text-stone-800 mb-3">Landesbeauftragte für Menschen mit Behinderungen Baden-Württemberg</h3>
                <div className="text-sm space-y-2">
                  <p>Geschäftsstelle der Landesbehindertenbeauftragten</p>
                  <p>Else-Josenhans-Str. 6</p>
                  <p>70173 Stuttgart</p>
                  <p>
                    <strong>E-Mail:</strong>{' '}
                    <a href="mailto:bfbw@sm.bwl.de" className="text-amber-600 hover:text-amber-700 underline">
                      bfbw@sm.bwl.de
                    </a>
                  </p>
                  <p>
                    <strong>Website:</strong>{' '}
                    <a 
                      href="https://sozialministerium.baden-wuerttemberg.de/de/soziales/menschen-mit-behinderungen/" 
                      className="text-amber-600 hover:text-amber-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Baden-Württemberg Sozialministerium
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Technische Spezifikationen</h2>
              <p className="text-sm leading-relaxed mb-4">
                Die Barrierefreiheit dieser Website stützt sich auf die folgenden Technologien:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>HTML5</li>
                <li>CSS3</li>
                <li>JavaScript (für interaktive Funktionen)</li>
                <li>ARIA (Accessible Rich Internet Applications)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}