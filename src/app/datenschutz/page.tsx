export default function DatenschutzPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-8">Datenschutzerklärung</h1>
          
          <div className="text-stone-600 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">1. Datenschutz auf einen Blick</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Allgemeine Hinweise</h3>
                <p className="text-sm leading-relaxed">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Datenerfassung auf dieser Website</h3>
                <p className="text-sm leading-relaxed mb-2">
                  <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
                </p>
                <p className="text-sm leading-relaxed">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">2. Hosting</h2>
            <p className="text-sm leading-relaxed">
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter. Alle Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei können u. a. IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, betroffen sein.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Datenschutz</h3>
                <p className="text-sm leading-relaxed">
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Hinweis zur verantwortlichen Stelle</h3>
                <p className="text-sm leading-relaxed mb-2">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <div className="text-sm space-y-1 ml-4">
                  <p>NAMLA GmbH</p>
                  <p>Zeitblomstr. 31/2</p>
                  <p>89073 Ulm</p>
                  <p>Geschäftsführer: Ragai Bichay</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Speicherdauer</h3>
                <p className="text-sm leading-relaxed">
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Datenerfassung auf dieser Website</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Server-Log-Dateien</h3>
                <p className="text-sm leading-relaxed">
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Kontaktformular</h3>
                <p className="text-sm leading-relaxed">
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Ihre Rechte</h2>
            <div className="space-y-2 text-sm">
              <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.</p>
              <p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}