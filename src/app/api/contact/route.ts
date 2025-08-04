import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, turnstileToken, projectName } = await request.json()

    // Validate required fields
    if (!name || !email || !message || !turnstileToken) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

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