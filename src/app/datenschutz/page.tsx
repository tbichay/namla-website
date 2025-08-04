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
            <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Cookies und Website-Funktionen</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Was sind Cookies?</h3>
                <p className="text-sm leading-relaxed mb-4">
                  Diese Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Cookie-Kategorien auf unserer Website</h3>
                
                <div className="space-y-4">
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <h4 className="font-medium text-stone-800 mb-2">🍪 Notwendige Cookies</h4>
                    <p className="text-sm leading-relaxed mb-2">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc text-stone-600">
                      <li><strong>namla-cookie-consent</strong>: Speichert Ihre Cookie-Einstellungen (Dauer: 1 Jahr)</li>
                      <li><strong>Session-Cookies</strong>: Für die sichere Navigation auf der Website</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-stone-800 mb-2">📊 Analyse-Cookies (optional)</h4>
                    <p className="text-sm leading-relaxed mb-2">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, um sie zu verbessern.
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc text-stone-600">
                      <li><strong>Google Analytics</strong>: Anonymisierte Nutzungsstatistiken</li>
                      <li><strong>_ga, _ga_*</strong>: Google Analytics Cookies (Dauer: 2 Jahre)</li>
                      <li><strong>_gid</strong>: Google Analytics Session-Cookie (Dauer: 24 Stunden)</li>
                    </ul>
                    <p className="text-xs text-stone-500 mt-2">
                      <strong>Rechtsgrundlage:</strong> Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-stone-800 mb-2">🎯 Marketing-Cookies (optional)</h4>
                    <p className="text-sm leading-relaxed mb-2">
                      Diese Cookies werden verwendet, um Ihnen relevante Werbung und Inhalte zu zeigen.
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc text-stone-600">
                      <li><strong>Google Ads</strong>: Für personalisierte Werbung</li>
                      <li><strong>_gcl_*</strong>: Google Conversion Tracking (Dauer: 90 Tage)</li>
                    </ul>
                    <p className="text-xs text-stone-500 mt-2">
                      <strong>Rechtsgrundlage:</strong> Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Google Consent Mode v2</h3>
                <p className="text-sm leading-relaxed mb-2">
                  Wir verwenden Google Consent Mode v2, um Ihre Cookie-Einstellungen zu respektieren. Ohne Ihre Einwilligung werden nur anonymisierte, aggregierte Daten an Google übertragen.
                </p>
                <p className="text-sm leading-relaxed">
                  Sie können Ihre Cookie-Einstellungen jederzeit über das Cookie-Banner am unteren Bildschirmrand ändern oder Cookies in Ihren Browsereinstellungen verwalten.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Ihre Cookie-Rechte</h3>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>Sie können Ihre Einwilligung jederzeit widerrufen</li>
                  <li>Sie können Cookies in Ihren Browsereinstellungen deaktivieren</li>
                  <li>Sie haben das Recht auf Auskunft über gespeicherte Cookies</li>
                  <li>Sie können die Löschung Ihrer Cookie-Daten verlangen</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Datenerfassung auf dieser Website</h2>
            
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

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Newsletter</h3>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Verarbeitete Daten:</strong> E-Mail-Adresse, Name (optional), IP-Adresse (zur Protokollierung), Zeitstempel der Anmeldung und Bestätigung
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Rechtsgrundlage:</strong> Die Verarbeitung der in das Newsletter-Anmeldeformular eingetragenen Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Double-Opt-In-Verfahren:</strong> Die Newsletter-Anmeldung erfolgt in einem sogenannten Double-Opt-In-Verfahren. Das heißt, Sie erhalten nach der Anmeldung eine E-Mail, in der Sie um die Bestätigung Ihrer Anmeldung gebeten werden.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Widerruf:</strong> Die erteilte Einwilligung zur Speicherung der Daten, der E-Mail-Adresse sowie deren Nutzung zum Versand des Newsletters können Sie jederzeit widerrufen, etwa über den "Abmelden"-Link im Newsletter oder durch eine E-Mail an info@namla.de.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Speicherdauer:</strong> Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Die E-Mail-Adresse wird dementsprechend solange gespeichert, wie das Abonnement des Newsletters aktiv ist.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">6. Ihre Rechte nach der DSGVO</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Ihre Betroffenenrechte</h3>
                <ul className="text-sm space-y-2 ml-4 list-disc">
                  <li><strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.</li>
                  <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie haben das Recht, die Berichtigung unrichtiger oder die Vervollständigung richtiger Daten zu verlangen.</li>
                  <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer personenbezogenen Daten verlangen.</li>
                  <li><strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung verlangen.</li>
                  <li><strong>Recht auf Widerspruch (Art. 21 DSGVO):</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
                  <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können verlangen, dass wir Ihnen Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format übermitteln.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Widerruf von Einwilligungen</h3>
                <p className="text-sm leading-relaxed">
                  Sofern die Verarbeitung der personenbezogenen Daten auf einer erteilten Einwilligung beruht, haben Sie jederzeit das Recht, die Einwilligung zu widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Beschwerderecht</h3>
                <p className="text-sm leading-relaxed">
                  Sie haben das Recht, sich bei einer Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
                </p>
              </div>
              
              <div className="bg-stone-50 p-4 rounded-lg">
                <h3 className="font-semibold text-stone-800 mb-2">Kontakt für Datenschutzanliegen</h3>
                <p className="text-sm leading-relaxed mb-2">
                  Für Fragen zum Datenschutz und zur Ausübung Ihrer Rechte wenden Sie sich an:
                </p>
                <div className="text-sm space-y-1">
                  <p><strong>E-Mail:</strong> datenschutz@namla.de</p>
                  <p><strong>Post:</strong> NAMLA GmbH, Zeitblomstr. 31/2, 89073 Ulm</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">7. Aktualität dieser Datenschutzerklärung</h2>
            <p className="text-sm leading-relaxed">
              Diese Datenschutzerklärung wurde zuletzt am <strong>30. Januar 2025</strong> aktualisiert. Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}