import { NextRequest, NextResponse } from 'next/server'
import { NewsletterService } from '@/lib/services/newsletter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // Debug logging
    console.log('Newsletter confirmation request:', {
      url: request.url,
      token: token,
      searchParams: Object.fromEntries(searchParams.entries())
    })

    if (!token) {
      console.error('No token provided in newsletter confirmation request')
      return NextResponse.json(
        { error: 'Bestätigungstoken fehlt' },
        { status: 400 }
      )
    }

    const result = await NewsletterService.confirm(token)

    console.log('Newsletter confirmation result:', result)

    // Redirect to a confirmation page with success/error message
    const baseUrl = new URL(request.url).origin
    const redirectUrl = new URL('/newsletter/bestaetigt', baseUrl)
    redirectUrl.searchParams.set('success', result.success.toString())
    redirectUrl.searchParams.set('message', result.message)

    console.log('Redirecting to:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    
    // Redirect to error page
    const baseUrl = new URL(request.url).origin
    const redirectUrl = new URL('/newsletter/bestaetigt', baseUrl)
    redirectUrl.searchParams.set('success', 'false')
    redirectUrl.searchParams.set('message', 'Fehler bei der Bestätigung')

    console.log('Error redirect to:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)
  }
}