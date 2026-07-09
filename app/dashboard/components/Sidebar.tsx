'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function Sidebar() {
  const params = useParams()
  const universityId = params.id as string | undefined
  const careerId = params.careerId as string | undefined

  if (!universityId) return null

  const base = `/dashboard/universities/${universityId}`

  const links = [
    { href: `${base}/careers`, label: 'Careers' },
    { href: `${base}/professors`, label: 'Professors' },
    { href: `${base}/classrooms`, label: 'Classrooms' },
  ]

  const careerLinks = [
    { href: `${base}/careers/${careerId ?? ''}/courses`, label: 'Courses' },
    { href: `${base}/careers/${careerId ?? ''}/schedules`, label: 'Schedule Builder' },
  ]

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-100 p-4 shrink-0">
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors"
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Career tools</p>
          {careerLinks.map((link) => (
            careerId ? (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <div
                key={link.label}
                className="block px-3 py-2 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
              >
                {link.label}
              </div>
            )
          ))}
        </div>
      </nav>
    </aside>
  )
}
