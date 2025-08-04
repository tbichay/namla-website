import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/lib/services/newsletter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Abmeldetoken fehlt' },
        { status: 400 }
      )
    }

    const result = await NewsletterService.unsubscribe(token)

    // Redirect to an unsubscribe confirmation page
    const redirectUrl = new URL('/newsletter/abgemeldet', request.url)
    redirectUrl.searchParams.set('success', result.success.toString())
    redirectUrl.searchParams.set('message', result.message)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    
    // Redirect to error page
    const redirectUrl = new URL('/newsletter/abgemeldet', request.url)
    redirectUrl.searchParams.set('success', 'false')
    redirectUrl.searchParams.set('message', 'Fehler bei der Abmeldung')

    return NextResponse.redirect(redirectUrl)
  }
}