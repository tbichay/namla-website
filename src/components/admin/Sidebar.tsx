'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  LogOut,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { ShadcnButton } from '@/components/ui/shadcn-button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  session: any
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projekte', href: '/admin/projects', icon: FolderOpen },
  { name: 'Einstellungen', href: '/admin/settings', icon: Settings },
]

export default function Sidebar({ session }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar()
  }, [pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              aria-label="Toggle sidebar"
              aria-expanded={isOpen}
              aria-controls="sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-3">
              <Building2 className="h-6 w-6 text-stone-900" />
              <span className="ml-2 text-lg font-bold text-stone-900">NAMLA</span>
              <span className="ml-2 text-sm text-stone-500">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-stone-200 transform transition-transform duration-300 ease-in-out",
          // Mobile: slide in from left
          "lg:transform-none lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center h-16 px-6 border-b border-stone-200">
            <Building2 className="h-8 w-8 text-stone-900" />
            <span className="ml-2 text-xl font-bold text-stone-900">NAMLA</span>
            <span className="ml-2 text-sm text-stone-500">Admin</span>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-stone-200">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-stone-900" />
              <span className="ml-2 text-lg font-bold text-stone-900">NAMLA</span>
              <span className="ml-2 text-sm text-stone-500">Admin</span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar} // Close sidebar on mobile after navigation
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                    // Touch-friendly sizing (48px minimum)
                    "min-h-[48px]",
                    isActive
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-stone-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-stone-600">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {session?.user?.email || 'admin@namla.com'}
                </p>
              </div>
            </div>
            <ShadcnButton
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full min-h-[44px]" // Touch-friendly
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </ShadcnButton>
          </div>
        </div>
      </div>
    </>
  )
}