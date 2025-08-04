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

  let emailHtml: string
  try {
    const emailElement = ContactEmail({
      name,
      email,
      message,
      projectName,
      isProjectInquiry
    })
    
    emailHtml = await render(emailElement)
    
    // Debug logging
    console.log('Email render result type:', typeof emailHtml)
    console.log('Email render result preview:', emailHtml.substring(0, 100))
    
    if (typeof emailHtml !== 'string') {
      throw new Error(`Expected string from render(), got ${typeof emailHtml}`)
    }
  } catch (error) {
    console.error('Email rendering error:', error)
    throw new Error('Failed to render email template')
  }

  // Send email to NAMLA
  const namlaEmailResult = await resend.emails.send({
    from: 'NAMLA Website <no-reply@namla.de>',
    to: ['info@namla.de'],
    subject,
    html: emailHtml,
    replyTo: email,
  })

  // If this is a project inquiry, also send confirmation email to the interested person
  if (isProjectInquiry && projectName) {
    try {
      const confirmationElement = ProjectInterestConfirmationEmail({
        name,
        projectName,
        projectLocation,
        projectStatus
      })
      
      const confirmationHtml = await render(confirmationElement)
      
      if (typeof confirmationHtml !== 'string') {
        throw new Error(`Expected string from render(), got ${typeof confirmationHtml}`)
      }

      await resend.emails.send({
        from: 'NAMLA <info@namla.de>',
        to: [email],
        subject: `Vielen Dank für Ihr Interesse an ${projectName}`,
        html: confirmationHtml,
      })
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

  const baseUrl = getBaseUrl()
  const confirmationUrl = `${baseUrl}/api/newsletter/confirm?token=${data.confirmationToken}`
  
  // Debug logging
  console.log('Newsletter confirmation email:', {
    baseUrl,
    confirmationUrl,
    token: data.confirmationToken
  })
  
  const emailElement = NewsletterConfirmationEmail({
    name: data.name,
    confirmationUrl
  })
  
  const emailHtml = await render(emailElement)
  
  if (typeof emailHtml !== 'string') {
    throw new Error(`Expected string from render(), got ${typeof emailHtml}`)
  }

  return await resend.emails.send({
    from: 'NAMLA Newsletter <newsletter@namla.de>',
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
  
  const emailElement = NewsletterWelcomeEmail({
    name: data.name,
    unsubscribeUrl
  })
  
  const emailHtml = await render(emailElement)
  
  if (typeof emailHtml !== 'string') {
    throw new Error(`Expected string from render(), got ${typeof emailHtml}`)
  }

  return await resend.emails.send({
    from: 'NAMLA Newsletter <newsletter@namla.de>',
    to: [data.email],
    subject: 'Willkommen beim NAMLA Newsletter!',
    html: emailHtml,
  })
}

// Helper function to get base URL for email links
function getBaseUrl(): string {
  // TEMPORARY: Use the current working Vercel URL until namla.de domain is configured
  // This ensures newsletter confirmation links work
  if (process.env.NODE_ENV === 'production') {
    return 'https://namla-website-n1nqz9q5l-tom-bichays-projects.vercel.app'
  }
  
  // Use VERCEL_URL for preview/development
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
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