export default function ImpressumPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-8">Impressum</h1>
          
          <div className="text-stone-600 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Angaben gemäß § 5 TMG</h2>
            <div className="space-y-2">
              <p>NAMLA GmbH</p>
              <p>Zeitblomstr. 31/2</p>
              <p>89073 Ulm</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Vertreten durch</h2>
            <p>Geschäftsführer: Ragai Bichay</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Registereintrag</h2>
            <div className="space-y-1">
              <p>Amtsgericht: Ulm</p>
              <p>Handelsregister: HRB 731258</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Umsatzsteuer-ID</h2>
            <p>Steuernummer: 88003/51462</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Haftungsausschluss</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Haftung für Inhalte</h3>
                <p className="text-sm leading-relaxed">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Haftung für Links</h3>
                <p className="text-sm leading-relaxed">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Urheberrecht</h3>
                <p className="text-sm leading-relaxed">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}