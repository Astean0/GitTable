import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">GitTableHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm text-gray-600 hover:text-black transition-colors">
            About
          </a>
          <a href="#services" className="text-sm text-gray-600 hover:text-black transition-colors">
            Services
          </a>
          <a href="#team" className="text-sm text-gray-600 hover:text-black transition-colors">
            Team
          </a>
          <a href="#faq" className="text-sm text-gray-600 hover:text-black transition-colors">
            FAQ
          </a>
          <a href="#contact" className="text-sm text-gray-600 hover:text-black transition-colors">
            Contact
          </a>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
