'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Button from "@/components/ui/Button"
import { toast } from 'react-hot-toast'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const { data: session } = useSession()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!consent) {
      toast.error('Bitte stimmen Sie der Datenschutzerklärung zu.')
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          consent: true,
          source: 'coming_soon'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Bestätigungs-E-Mail wurde gesendet!')
        setEmail('')
        setName('')
        setConsent(false)
      } else {
        toast.error(data.error || 'Fehler beim Anmelden')
      }
    } catch (error) {
      toast.error('Fehler beim Anmelden. Versuchen Sie es später erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await signIn('credentials', {
        email: adminEmail,
        password: adminPassword,
        redirect: false
      })

      if (result?.error) {
        toast.error('Ungültige Anmeldedaten')
      } else {
        toast.success('Erfolgreich angemeldet - Preview Modus aktiviert')
        setShowAdminLogin(false)
        // Page will re-render with full site access
      }
    } catch (error) {
      toast.error('Anmeldung fehlgeschlagen')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
        {/* Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Bald ist es soweit
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-800 mb-6 leading-tight">
          Unsere neue Website
          <br />
          <span className="text-amber-600">entsteht gerade</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-stone-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          Wir arbeiten an einer noch besseren digitalen Präsentation unserer hochwertigen 
          Wohnimmobilien und über 50 Jahre Bauerfahrung.
        </p>

        {/* Newsletter Signup */}
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 mb-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            Informiert bleiben
          </h2>
          <p className="text-stone-600 mb-6">
            Erfahren Sie als Erste, wenn unsere neue Website online geht und 
            neue Immobilienprojekte verfügbar werden.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr Name (optional)"
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                required
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="newsletter-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-1 w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="newsletter-consent" className="text-sm text-stone-600 leading-relaxed">
                Ich stimme zu, dass meine E-Mail-Adresse für den Newsletter-Versand gespeichert wird. 
                Die Einwilligung kann jederzeit widerrufen werden. Weitere Informationen finden Sie in unserer{' '}
                <a href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                  Datenschutzerklärung
                </a>.
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !consent}
              className="w-full px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Anmelden...' : 'Newsletter abonnieren'}
            </button>
          </form>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Seit 1974</h3>
            <p className="text-stone-600">Über 50 Jahre Erfahrung im Bauwesen</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Familiengeführt</h3>
            <p className="text-stone-600">Zwei Generationen Bauträger-Expertise</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">170+ Wohneinheiten</h3>
            <p className="text-stone-600">Erfolgreich realisiert in der Region Ulm</p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-stone-100 rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            Haben Sie Fragen zu unseren Projekten?
          </h2>
          <p className="text-stone-600 mb-6">
            Auch während der Website-Erneuerung sind wir gerne für Sie da. 
            Kontaktieren Sie uns für Informationen zu aktuellen Wohnprojekten.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/kontakt">
              Kontakt aufnehmen
            </Button>
            <Button href="tel:+4973120987654" variant="secondary">
              📞 Direkt anrufen
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-stone-800">Admin Login</h3>
              <button
                onClick={() => setShowAdminLogin(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Passwort
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Anmelden...' : 'Anmelden'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discrete Admin Login Link */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowAdminLogin(true)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Admin
        </button>
      </div>
    </div>
  )
}