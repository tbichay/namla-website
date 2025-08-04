'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

interface ProjectInterestFormProps {
  projectName: string
  projectLocation?: string
  projectStatus?: string
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

export default function ProjectInterestForm({
  projectName,
  projectLocation,
  projectStatus,
  isOpen = true,
  onClose,
  className = ''
}: ProjectInterestFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Pre-fill message with project context
    const contextMessage = `Hallo,

ich interessiere mich für das Projekt "${projectName}"${projectLocation ? ` in ${projectLocation}` : ''}${projectStatus ? ` (Status: ${projectStatus})` : ''}.

${formData.message || 'Bitte kontaktieren Sie mich für weitere Informationen.'}

Vielen Dank!`

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: contextMessage,
          projectName,
          turnstileToken: 'project-interest' // We'll skip Turnstile for project interest for better UX
        }),
      })

      if (response.ok) {
        toast.success('Vielen Dank für Ihr Interesse! Wir melden uns zeitnah bei Ihnen.')
        setFormData({ name: '', email: '', phone: '', message: '' })
        onClose?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Fehler beim Senden der Anfrage')
      }
    } catch (error) {
      toast.error('Fehler beim Senden der Anfrage')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-stone-200 ${className}`}>
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">
              Interesse bekunden
            </h3>
            <p className="text-stone-600 text-sm sm:text-base">
              Projekt: <span className="font-semibold text-stone-800">{projectName}</span>
              {projectLocation && (
                <span className="text-stone-500"> • {projectLocation}</span>
              )}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Schließen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="interest-name" className="block text-sm font-medium text-stone-800 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="interest-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm"
                placeholder="Ihr vollständiger Name"
              />
            </div>
            
            <div>
              <label htmlFor="interest-phone" className="block text-sm font-medium text-stone-800 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                id="interest-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm"
                placeholder="Für Rückfragen"
              />
            </div>
          </div>

          <div>
            <label htmlFor="interest-email" className="block text-sm font-medium text-stone-800 mb-1">
              E-Mail *
            </label>
            <input
              type="email"
              id="interest-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm"
              placeholder="ihre.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="interest-message" className="block text-sm font-medium text-stone-800 mb-1">
              Zusätzliche Nachricht
            </label>
            <textarea
              id="interest-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm resize-vertical"
              placeholder="Spezielle Wünsche oder Fragen zum Projekt..."
            />
          </div>

          <div className="bg-stone-50 p-4 rounded-md">
            <p className="text-xs text-stone-600 leading-relaxed">
              Mit dem Absenden erklären Sie sich einverstanden, dass wir Ihre Daten zur Bearbeitung 
              Ihrer Anfrage verwenden. Weitere Informationen finden Sie in unserer{' '}
              <a href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                Datenschutzerklärung
              </a>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.email}
              className="flex-1"
            >
              {isSubmitting ? 'Wird gesendet...' : 'Interesse bekunden'}
            </Button>
            {onClose && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Abbrechen
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}