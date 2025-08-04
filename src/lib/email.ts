import { Resend } from 'resend'
import { render } from '@react-email/render'
import ContactEmail from '@/emails/ContactEmail'
import ProjectInterestConfirmationEmail from '@/emails/ProjectInterestConfirmationEmail'
import NewsletterConfirmationEmail from '@/emails/NewsletterConfirmationEmail'
import NewsletterWelcomeEmail from '@/emails/NewsletterWelcomeEmail'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ContactEmailData {
  name: string
  email: string
  message: string
  projectName?: string
  projectLocation?: string
  projectStatus?: string
  isProjectInquiry?: boolean
}

export interface NewsletterEmailData {
  email: string
  name?: string
  confirmationToken?: string
  unsubscribeToken?: string
}

// Send contact form email
export async function sendContactEmail(data: ContactEmailData) {
  const { name, email, message, projectName, projectLocation, projectStatus, isProjectInquiry } = data
  
  const subject = isProjectInquiry && projectName
    ? `Projektanfrage: ${projectName} - ${name}`
    : `Neue Kontaktanfrage von ${name}`

  const emailHtml = render(
    ContactEmail({
      name,
      email,
      message,
      projectName,
      isProjectInquiry
    })
  )

  // Send email to NAMLA
  console.log('Attempting to send email to NAMLA with Resend...')
  console.log('Resend API Key available:', !!process.env.RESEND_API_KEY)
  
  const namlaEmailResult = await resend.emails.send({
    from: 'NAMLA Website <onboarding@resend.dev>',
    to: ['info@namla.de'],
    subject,
    html: emailHtml,
    replyTo: email,
  })
  
  console.log('NAMLA email result:', namlaEmailResult)

  // If this is a project inquiry, also send confirmation email to the interested person
  if (isProjectInquiry && projectName) {
    try {
      const confirmationHtml = render(
        ProjectInterestConfirmationEmail({
          name,
          projectName,
          projectLocation,
          projectStatus
        })
      )

      console.log('Sending confirmation email to:', email)
      
      const confirmationResult = await resend.emails.send({
        from: 'NAMLA <onboarding@resend.dev>',
        to: [email],
        subject: `Vielen Dank für Ihr Interesse an ${projectName}`,
        html: confirmationHtml,
      })
      
      console.log('Confirmation email result:', confirmationResult)
    } catch (error) {
      // Don't fail the main email if confirmation email fails
      console.error('Failed to send project interest confirmation email:', error)
    }
  }

  return namlaEmailResult
}

// Send newsletter confirmation email
export async function sendNewsletterConfirmationEmail(data: NewsletterEmailData) {
  if (!data.confirmationToken) {
    throw new Error('Confirmation token is required')
  }

  const confirmationUrl = `${getBaseUrl()}/api/newsletter/confirm?token=${data.confirmationToken}`
  
  const emailHtml = render(
    NewsletterConfirmationEmail({
      name: data.name,
      confirmationUrl
    })
  )

  return await resend.emails.send({
    from: 'NAMLA Newsletter <onboarding@resend.dev>',
    to: [data.email],
    subject: 'Newsletter-Anmeldung bestätigen - NAMLA',
    html: emailHtml,
  })
}

// Send newsletter welcome email
export async function sendNewsletterWelcomeEmail(data: NewsletterEmailData) {
  if (!data.unsubscribeToken) {
    throw new Error('Unsubscribe token is required')
  }

  const unsubscribeUrl = `${getBaseUrl()}/api/newsletter/unsubscribe?token=${data.unsubscribeToken}`
  
  const emailHtml = render(
    NewsletterWelcomeEmail({
      name: data.name,
      unsubscribeUrl
    })
  )

  return await resend.emails.send({
    from: 'NAMLA Newsletter <onboarding@resend.dev>',
    to: [data.email],
    subject: 'Willkommen beim NAMLA Newsletter!',
    html: emailHtml,
  })
}

// Helper function to get base URL
function getBaseUrl(): string {
  // In production, use VERCEL_URL with https
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Use NEXT_PUBLIC_SITE_URL if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Development fallback
  return 'http://localhost:3000'
}

// Generate secure random token
export function generateToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

export { resend }