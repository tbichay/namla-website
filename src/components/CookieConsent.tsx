'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateGoogleConsent } from '@/lib/gtm-consent'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('namla-cookie-consent')
    if (!consent) {
      setIsVisible(true)
    } else {
      // Load saved preferences and apply them
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
      applyConsent(savedPreferences)
    }
  }, [])

  const applyConsent = (prefs: CookiePreferences) => {
    // Apply consent using our consent management system
    updateGoogleConsent(prefs)
    
    // You can add other analytics/marketing service configurations here
    console.log('Cookie preferences applied:', prefs)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('namla-cookie-consent', JSON.stringify(consentData))
    applyConsent(prefs)
    setIsVisible(false)
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    }
    saveConsent(allAccepted)
  }

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    saveConsent(onlyNecessary)
  }

  const savePreferences = () => {
    saveConsent(preferences)
  }

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return // Can't change necessary cookies
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }))
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {!showDetails ? (
            /* Simple Banner */
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  🍪 Cookies & Datenschutz
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Wir verwenden Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen. 
                  Notwendige Cookies sind für die Grundfunktionen erforderlich. Mit Ihrer Einwilligung verwenden 
                  wir auch Analyse-Cookies zur Verbesserung unserer Website.{' '}
                  <Link href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                    Mehr in der Datenschutzerklärung
                  </Link>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 rounded transition-colors"
                >
                  Einstellungen
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 rounded transition-colors"
                >
                  Alle ablehnen
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 rounded transition-colors font-medium"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Settings */
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-800">
                  Cookie-Einstellungen
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-stone-500 hover:text-stone-700"
                  aria-label="Zurück zur einfachen Ansicht"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-800 mb-1">Notwendige Cookies</h4>
                    <p className="text-xs text-stone-600">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <div className="w-10 h-6 bg-stone-800 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-3 border border-stone-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-800 mb-1">Analyse-Cookies</h4>
                    <p className="text-xs text-stone-600">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, um sie zu verbessern.
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        preferences.analytics ? 'bg-stone-800' : 'bg-stone-300'
                      }`}
                      aria-label={`Analyse-Cookies ${preferences.analytics ? 'deaktivieren' : 'aktivieren'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        preferences.analytics ? 'translate-x-4' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-3 border border-stone-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-800 mb-1">Marketing-Cookies</h4>
                    <p className="text-xs text-stone-600">
                      Diese Cookies werden verwendet, um Ihnen relevante Werbung und Inhalte zu zeigen.
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        preferences.marketing ? 'bg-stone-800' : 'bg-stone-300'
                      }`}
                      aria-label={`Marketing-Cookies ${preferences.marketing ? 'deaktivieren' : 'aktivieren'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        preferences.marketing ? 'translate-x-4' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={rejectAll}
                  className="px-6 py-2 text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 rounded transition-colors"
                >
                  Alle ablehnen
                </button>
                <button
                  onClick={savePreferences}
                  className="px-6 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 rounded transition-colors font-medium"
                >
                  Auswahl speichern
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm bg-amber-600 text-white hover:bg-amber-700 rounded transition-colors font-medium"
                >
                  Alle akzeptieren
                </button>
              </div>

              <p className="text-xs text-stone-500 text-center mt-4">
                Weitere Informationen finden Sie in unserer{' '}
                <Link href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                  Datenschutzerklärung
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Global gtag declaration for TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}