import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/lib/services/newsletter'

export async function POST(request: NextRequest) {
  try {
    const { email, name, consent, interests, source } = await request.json()

    // Validate required fields
    if (!email || !consent) {
      return NextResponse.json(
        { error: 'E-Mail und Einverständnis sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    // Get client IP and User Agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await NewsletterService.subscribe({
      email: email.toLowerCase().trim(),
      name: name?.trim() || undefined,
      source: source || 'coming_soon',
      interests: interests || [],
      ipAddress,
      userAgent
    })

    if (result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Newsletter-Anmeldung' },
      { status: 500 }
    )
  }
}