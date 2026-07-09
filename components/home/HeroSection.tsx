import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Now available in Tarapacá
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          Schedule smarter,
          <br />
          not harder
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
          Intelligent scheduling that generates conflict-free university timetables in seconds.
          No more spreadsheets, no more chaos.
        </p>
        <p className="text-sm text-gray-400 max-w-xl mx-auto mb-10">
          If you upload your course data, we will create your schedule in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </Link>
          <Link
            href="/dashboard/universities"
            className="px-8 py-4 bg-gray-50 text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all border border-gray-200"
          >
            Open Dashboard →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-12 border-t border-gray-100">
          <div>
            <div className="text-3xl font-bold text-gray-900">10s</div>
            <div className="text-sm text-gray-500 mt-1">Generation</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-500 mt-1">Conflict-free</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">∞</div>
            <div className="text-sm text-gray-500 mt-1">Scalability</div>
          </div>
        </div>
      </div>
    </section>
  )
}
