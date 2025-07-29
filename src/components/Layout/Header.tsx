'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Startseite', href: '/' },
    { name: 'Projekte', href: '/projekte' },
    { name: 'Über uns', href: '/ueber-uns' },
    { name: 'Kontakt', href: '/kontakt' },
  ]

  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black">
            NAMLA
          </Link>
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-lg transition-colors ${
                  pathname === item.href
                    ? 'text-black font-medium'
                    : 'text-gray-600 hover:text-black'
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