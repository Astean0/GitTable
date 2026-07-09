import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">GitTableHub</h4>
            <p className="text-sm text-gray-500">
              Intelligent scheduling for modern universities
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#services" className="hover:text-black transition-colors">
                  Services
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-black transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#about" className="hover:text-black transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-black transition-colors">
                  Team
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-black transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          © 2026 GitTableHub. Based in Tarapacá, Chile.
        </div>
      </div>
    </footer>
  )
}
