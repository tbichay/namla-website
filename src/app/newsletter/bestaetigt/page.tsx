'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Button from '@/components/ui/Button'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const message = searchParams.get('message') || ''

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
          {success ? (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
                Newsletter bestätigt!
              </h1>
              
              <p className="text-stone-600 mb-8 leading-relaxed">
                {message || 'Vielen Dank! Ihre Newsletter-Anmeldung wurde erfolgreich bestätigt. Sie erhalten ab sofort Updates zu unseren Wohnimmobilienprojekten.'}
              </p>
              
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button href="/">
                  Zur Startseite
                </Button>
                <Button href="/projekte" variant="secondary">
                  Projekte ansehen
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
                Bestätigung fehlgeschlagen
              </h1>
              
              <p className="text-stone-600 mb-8 leading-relaxed">
                {message || 'Der Bestätigungslink ist ungültig oder abgelaufen. Bitte versuchen Sie sich erneut anzumelden.'}
              </p>
              
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button href="/">
                  Zur Startseite
                </Button>
                <Button href="/kontakt" variant="secondary">
                  Kontakt aufnehmen
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Company Info */}
        <div className="mt-12 text-center">
          <div className="text-stone-500 text-sm">
            <p className="font-semibold text-stone-800">NAMLA GmbH</p>
            <p>Zeitblomstr. 31/2, 89073 Ulm</p>
            <p>
              <a href="mailto:info@namla.de" className="text-amber-600 hover:text-amber-700">
                info@namla.de
              </a>
              {' | '}
              <a href="tel:+4973120987654" className="text-amber-600 hover:text-amber-700">
                Telefon
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsletterConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-stone-600">Laden...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}