import { eq, and } from 'drizzle-orm'
import { db, newsletterSubscribers, type NewsletterSubscriber, type NewNewsletterSubscriber } from '@/lib/db'
import { generateToken, sendNewsletterConfirmationEmail, sendNewsletterWelcomeEmail } from '@/lib/email'

export class NewsletterService {
  // Subscribe a new email (with double opt-in)
  static async subscribe(data: {
    email: string
    name?: string
    source?: string
    interests?: string[]
    ipAddress?: string
    userAgent?: string
  }): Promise<{ success: boolean; message: string }> {
    const { email, name, source = 'coming_soon', interests, ipAddress, userAgent } = data

    try {
      // Check if email already exists
      const existing = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, email))
        .limit(1)

      if (existing.length > 0) {
        const subscriber = existing[0]
        
        // If already confirmed, return success message
        if (subscriber.status === 'confirmed') {
          return {
            success: true,
            message: 'Sie sind bereits für unseren Newsletter angemeldet.'
          }
        }
        
        // If pending, resend confirmation
        if (subscriber.status === 'pending' && subscriber.confirmationToken) {
          await sendNewsletterConfirmationEmail({
            email: subscriber.email,
            name: subscriber.name || undefined,
            confirmationToken: subscriber.confirmationToken
          })
          
          return {
            success: true,
            message: 'Bestätigungs-E-Mail wurde erneut gesendet.'
          }
        }
        
        // If unsubscribed, reactivate with new tokens
        if (subscriber.status === 'unsubscribed') {
          const confirmationToken = generateToken()
          const unsubscribeToken = generateToken()
          
          await db
            .update(newsletterSubscribers)
            .set({
              status: 'pending',
              confirmationToken,
              unsubscribeToken,
              unsubscribedAt: null,
              updatedAt: new Date()
            })
            .where(eq(newsletterSubscribers.id, subscriber.id))
          
          await sendNewsletterConfirmationEmail({
            email: subscriber.email,
            name: subscriber.name || undefined,
            confirmationToken
          })
          
          return {
            success: true,
            message: 'Bestätigungs-E-Mail wurde gesendet.'
          }
        }
      }

      // Create new subscriber
      const confirmationToken = generateToken()
      const unsubscribeToken = generateToken()
      
      const newSubscriber: NewNewsletterSubscriber = {
        email,
        name,
        status: 'pending',
        confirmationToken,
        unsubscribeToken,
        interests: interests ? JSON.stringify(interests) : null,
        source,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.insert(newsletterSubscribers).values(newSubscriber)

      // Send confirmation email
      await sendNewsletterConfirmationEmail({
        email,
        name,
        confirmationToken
      })

      return {
        success: true,
        message: 'Bestätigungs-E-Mail wurde gesendet. Bitte prüfen Sie Ihr Postfach.'
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      return {
        success: false,
        message: 'Fehler bei der Anmeldung. Bitte versuchen Sie es später erneut.'
      }
    }
  }

  // Confirm subscription
  static async confirm(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscriber = await db
        .select()
        .from(newsletterSubscribers)
        .where(
          and(
            eq(newsletterSubscribers.confirmationToken, token),
            eq(newsletterSubscribers.status, 'pending')
          )
        )
        .limit(1)

      if (subscriber.length === 0) {
        return {
          success: false,
          message: 'Ungültiger oder abgelaufener Bestätigungslink.'
        }
      }

      const user = subscriber[0]

      // Update status to confirmed
      await db
        .update(newsletterSubscribers)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmationToken: null, // Clear the token
          updatedAt: new Date()
        })
        .where(eq(newsletterSubscribers.id, user.id))

      // Send welcome email
      if (user.unsubscribeToken) {
        await sendNewsletterWelcomeEmail({
          email: user.email,
          name: user.name || undefined,
          unsubscribeToken: user.unsubscribeToken
        })
      }

      return {
        success: true,
        message: 'Newsletter-Anmeldung bestätigt! Willkommen bei NAMLA.'
      }
    } catch (error) {
      console.error('Newsletter confirmation error:', error)
      return {
        success: false,
        message: 'Fehler bei der Bestätigung. Bitte versuchen Sie es später erneut.'
      }
    }
  }

  // Unsubscribe
  static async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscriber = await db
        .select()
        .from(newsletterSubscribers)
        .where(
          and(
            eq(newsletterSubscribers.unsubscribeToken, token),
            eq(newsletterSubscribers.status, 'confirmed')
          )
        )
        .limit(1)

      if (subscriber.length === 0) {
        return {
          success: false,
          message: 'Ungültiger Abmeldelink oder Sie sind bereits abgemeldet.'
        }
      }

      const user = subscriber[0]

      // Update status to unsubscribed
      await db
        .update(newsletterSubscribers)
        .set({
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(newsletterSubscribers.id, user.id))

      return {
        success: true,
        message: 'Sie wurden erfolgreich vom Newsletter abgemeldet.'
      }
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error)
      return {
        success: false,
        message: 'Fehler bei der Abmeldung. Bitte versuchen Sie es später erneut.'
      }
    }
  }

  // Get subscriber statistics (for admin)
  static async getStats(): Promise<{
    total: number
    confirmed: number
    pending: number
    unsubscribed: number
  }> {
    try {
      const stats = await db
        .select()
        .from(newsletterSubscribers)

      const total = stats.length
      const confirmed = stats.filter(s => s.status === 'confirmed').length
      const pending = stats.filter(s => s.status === 'pending').length
      const unsubscribed = stats.filter(s => s.status === 'unsubscribed').length

      return { total, confirmed, pending, unsubscribed }
    } catch (error) {
      console.error('Newsletter stats error:', error)
      return { total: 0, confirmed: 0, pending: 0, unsubscribed: 0 }
    }
  }

  // Get all confirmed subscribers (for admin)
  static async getConfirmedSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      return await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, 'confirmed'))
    } catch (error) {
      console.error('Get confirmed subscribers error:', error)
      return []
    }
  }
}