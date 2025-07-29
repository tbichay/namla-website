'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formular gesendet:', formData)
    alert('Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen.')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Kontakt
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Haben Sie Fragen zu unseren Projekten oder möchten Sie ein persönliches 
            Beratungsgespräch vereinbaren? Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold text-black mb-8">
              Schreiben Sie uns
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-medium text-black mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors text-lg"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-black mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors text-lg"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-lg font-medium text-black mb-2">
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors text-lg resize-vertical"
                  placeholder="Teilen Sie uns mit, wie wir Ihnen helfen können..."
                />
              </div>
              
              <Button onClick={() => {}} className="w-full">
                Nachricht senden
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-black mb-8">
              Kontaktinformationen
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Adresse</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p>NAMLA Bauträger GmbH</p>
                  <p>Musterstraße 123</p>
                  <p>12345 Musterstadt</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Telefon & E-Mail</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p>Tel: +49 (0) 123 456789</p>
                  <p>Fax: +49 (0) 123 456790</p>
                  <p>E-Mail: info@namla.de</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Öffnungszeiten</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p>Montag - Freitag: 9:00 - 18:00 Uhr</p>
                  <p>Samstag: 10:00 - 14:00 Uhr</p>
                  <p>Sonntag: Nach Vereinbarung</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-bold text-black mb-4">Standort</h3>
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Karten Platzhalter</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center bg-gray-50 py-16 -mx-6 px-6">
          <h2 className="text-3xl font-bold text-black mb-6">
            Persönlichen Termin vereinbaren
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerne laden wir Sie zu einem unverbindlichen Beratungsgespräch in 
            unsere Räumlichkeiten ein oder besuchen Sie vor Ort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+491234567890"
              className="inline-block px-8 py-3 text-lg bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Jetzt anrufen
            </a>
            <a
              href="mailto:info@namla.de"
              className="inline-block px-8 py-3 text-lg border border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              E-Mail schreiben
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}