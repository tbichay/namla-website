'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Startseite', href: '/' },
    { name: 'Projekte', href: '/projekte' },
    { name: 'Über uns', href: '/ueber-uns' },
    { name: 'Kontakt', href: '/kontakt' },
  ]

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="flex items-center">
            {/* Mobile Logo - Clean Professional */}
            <div className="sm:hidden">
              <Image
                src="/logo-mobile.png?v=2"
                alt="NAMLA Logo"
                width={100}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </div>
            {/* Desktop Logo - Clean Professional */}
            <div className="hidden sm:block">
              <Image
                src="/logo.png?v=2"
                alt="NAMLA Logo"
                width={150}
                height={60}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base lg:text-lg transition-colors ${
                  pathname === item.href
                    ? 'text-stone-800 font-medium'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-800 transition-colors"
            aria-label="Menu öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="py-4 space-y-2 border-t border-stone-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 px-2 text-base transition-colors ${
                  pathname === item.href
                    ? 'text-stone-800 font-medium bg-stone-100'
                    : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}