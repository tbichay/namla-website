'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Map from '@/components/ui/Map'

interface TurnstileOptions {
  sitekey: string
  callback: (token: string) => void
  'error-callback'?: () => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | Element, options: TurnstileOptions) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onTurnstileCallback?: (token: string) => void
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  useEffect(() => {
    // Load Cloudflare Turnstile script
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Set up global callback for Turnstile
    window.onTurnstileCallback = (token: string) => {
      setTurnstileToken(token)
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
      alert('Bitte bestätigen Sie das CAPTCHA')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setTurnstileToken('')
        // Reset Turnstile widget
        if (window.turnstile) {
          window.turnstile.reset()
        }
      } else {
        const errorData = await response.json()
        setSubmitStatus('error')
        alert(errorData.error || 'Fehler beim Senden der Nachricht')
      }
    } catch {
      setSubmitStatus('error')
      alert('Fehler beim Senden der Nachricht')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header - Mobile First */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4 sm:mb-6 px-4">
            Kontakt
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-xl lg:max-w-2xl mx-auto px-4 leading-relaxed">
            Haben Sie Fragen zu unseren Projekten oder möchten Sie ein persönliches 
            Beratungsgespräch vereinbaren? Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>

        {/* Main Content Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="px-4 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 mb-6 sm:mb-8">
                Ihre Anfrage an uns
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-base sm:text-lg font-medium text-stone-800 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-stone-300 bg-white text-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors text-base sm:text-lg rounded-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-base sm:text-lg font-medium text-stone-800 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-stone-300 bg-white text-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors text-base sm:text-lg rounded-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-base sm:text-lg font-medium text-stone-800 mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-stone-300 bg-white text-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors text-base sm:text-lg resize-vertical rounded-sm"
                    placeholder="Beschreiben Sie Ihr Projekt oder Ihre Fragen..."
                  />
                </div>
              
              {/* Cloudflare Turnstile CAPTCHA */}
              <div className="flex justify-center">
                <div 
                  className="cf-turnstile" 
                  data-sitekey="0x4AAAAAABnP_RdvCnnwbH4Z"
                  data-callback="onTurnstileCallback"
                  data-theme="light"
                ></div>
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-sm">
                  Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen.
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
              </Button>
            </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="px-4 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 mb-6 sm:mb-8">
                Sprechen Sie uns an
              </h2>
              
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Unser Büro
                  </h3>
                  <div className="text-stone-600 leading-relaxed text-sm sm:text-base ml-8">
                    <p className="font-medium text-stone-800">NAMLA GmbH</p>
                    <p>Zeitblomstr. 31/2</p>
                    <p>89073 Ulm</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    E-Mail
                  </h3>
                  <div className="text-stone-600 leading-relaxed text-sm sm:text-base ml-8">
                    <p><a href="mailto:info@namla.de" className="hover:text-amber-600 transition-colors font-medium">info@namla.de</a></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Beratung
                  </h3>
                  <div className="text-stone-600 leading-relaxed text-sm sm:text-base ml-8">
                    <p>Persönliche Beratungstermine nach Vereinbarung</p>
                    <p className="text-xs text-stone-500 mt-1">Wir nehmen uns gerne Zeit für Ihre Fragen</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-4">Unser Standort</h3>
              <Map 
                coordinates={{ lat: 48.4010, lng: 9.9876 }}
                zoom={16}
                height="320px"
                address="NAMLA GmbH, Zeitblomstr. 31/2, 89073 Ulm"
                className="rounded-lg overflow-hidden"
              />
              <div className="mt-4 p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-600 text-center">
                  📍 Zeitblomstr. 31/2, 89073 Ulm • 
                  <a 
                    href="https://maps.google.com/?q=Zeitblomstr.+31/2,+89073+Ulm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 ml-1 font-medium"
                  >
                    In Google Maps öffnen
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - Mobile First */}
      </div>
    </div>
  )
}