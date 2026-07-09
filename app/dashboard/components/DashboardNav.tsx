'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/universities', label: 'Universities' },
  ]

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold">GitTableHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-black font-medium'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </header>
  )
}
