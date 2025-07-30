// Google Consent Mode v2 Implementation
// This file handles Google Tag Manager and Consent Mode integration

export interface ConsentState {
  analytics_storage: 'granted' | 'denied'
  ad_storage: 'granted' | 'denied' 
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted' | 'denied'
}

// Initialize Google Consent Mode with default denied state
export const initializeGoogleConsent = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Set default consent state to denied
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied', 
      ad_personalization: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted', // Always granted for security
      wait_for_update: 500 // Wait 500ms for consent update
    })

    // Initialize gtag config
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    })
  }
}

// Update consent based on user preferences
export const updateGoogleConsent = (preferences: {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const consentState: ConsentState = {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_storage: preferences.marketing ? 'granted' : 'denied',
      ad_user_data: preferences.marketing ? 'granted' : 'denied',
      ad_personalization: preferences.marketing ? 'granted' : 'denied',
      functionality_storage: preferences.necessary ? 'granted' : 'denied',
      personalization_storage: preferences.necessary ? 'granted' : 'denied',
      security_storage: 'granted' // Always granted
    }

    window.gtag('consent', 'update', consentState)

    // Log consent update for debugging (remove in production)
    console.log('Google Consent Mode updated:', consentState)
  }
}

// Track events with consent awareness
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Check if analytics consent is granted
    const consent = localStorage.getItem('namla-cookie-consent')
    if (consent) {
      const preferences = JSON.parse(consent)
      if (preferences.analytics) {
        window.gtag('event', eventName, parameters)
      }
    }
  }
}

// DSGVO-compliant analytics helper
export const trackPageView = (pagePath?: string) => {
  trackEvent('page_view', {
    page_path: pagePath || window.location.pathname,
    page_title: document.title
  })
}

// Track business-relevant events for real estate
export const trackProjectView = (projectId: string, projectName: string) => {
  trackEvent('project_view', {
    project_id: projectId,
    project_name: projectName,
    event_category: 'Real Estate',
    event_label: 'Project Detail View'
  })
}

export const trackContactFormStart = () => {
  trackEvent('contact_form_start', {
    event_category: 'Lead Generation',
    event_label: 'Contact Form Started'
  })
}

export const trackContactFormSubmit = () => {
  trackEvent('contact_form_submit', {
    event_category: 'Lead Generation',
    event_label: 'Contact Form Submitted'
  })
}