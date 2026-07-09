import Link from 'next/link'

const cards = [
  {
    title: 'Universities',
    description: 'Create and manage universities and their academic structure.',
    href: '/dashboard/universities',
  },
  {
    title: 'Schedule Builder',
    description: 'Open a career and start placing courses into the weekly timetable.',
    href: '/dashboard/universities',
  },
  {
    title: 'Planning tools',
    description: 'Manage professors, classrooms and courses from a single workspace.',
    href: '/dashboard/universities',
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Manage universities, careers, courses, and build conflict-free schedules.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-2">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
