'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/Footer"
import AdminPreviewBanner from "@/components/AdminPreviewBanner"

interface SessionBasedLayoutProps {
  children: React.ReactNode
}

export default function SessionBasedLayout({ children }: SessionBasedLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'admin'
  const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Legal pages and contact are always accessible
  const isLegalPage = ['/impressum', '/datenschutz', '/barrierefreiheit', '/kontakt'].includes(pathname)
  
  // Admin routes are always accessible
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api')
  
  // For admin or non-coming-soon mode, show full layout
  if (isAdmin || !comingSoonMode || isLegalPage || isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminPreviewBanner />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    )
  }
  
  // For public users in coming soon mode, show minimal layout for non-home pages
  if (pathname !== '/') {
    // Redirect to home page for coming soon mode
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return null
  }
  
  // For coming soon page, show minimal layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}