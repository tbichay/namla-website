import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, turnstileToken, projectName } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Nachricht sind erforderlich' },
        { status: 400 }
      )
    }

    // Skip Turnstile verification for project interest forms (better UX)
    // For general contact forms, Turnstile is still required
    if (turnstileToken && turnstileToken !== 'project-interest') {
      // Verify Cloudflare Turnstile token
      const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY!,
          response: turnstileToken,
        }),
      })

      const turnstileResult = await turnstileResponse.json()

      if (!turnstileResult.success) {
        return NextResponse.json(
          { error: 'CAPTCHA-Verifizierung fehlgeschlagen' },
          { status: 400 }
        )
      }
    } else if (!turnstileToken || turnstileToken === 'project-interest') {
      // For project interest, we skip CAPTCHA but add additional validation
      if (!projectName) {
        // If no project name and no turnstile token, require turnstile
        if (!turnstileToken) {
          return NextResponse.json(
            { error: 'CAPTCHA-Verifizierung erforderlich' },
            { status: 400 }
          )
        }
      }
    }

    // Send email using Resend
    await sendContactEmail({
      name,
      email,
      message,
      projectName,
      isProjectInquiry: !!projectName
    })

    return NextResponse.json(
      { message: 'Nachricht erfolgreich gesendet' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}