'use client'

import { useSession, signOut } from 'next-auth/react'

export default function AdminPreviewBanner() {
  const { data: session } = useSession()
  const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Only show banner if admin is logged in and coming soon mode is active
  if (!session?.user || !comingSoonMode) return null

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-sm flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>
          <strong>Admin Preview Modus</strong> - Website ist für die Öffentlichkeit noch nicht sichtbar
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-amber-100">
          Angemeldet als: {session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}