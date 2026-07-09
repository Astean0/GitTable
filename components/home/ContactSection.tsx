import Link from 'next/link'

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-6 bg-black text-white">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Contact</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Ready to transform your scheduling?
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
          Join universities across Tarapacá that are already saving time and reducing frustration
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all"
          >
            Get Started Free
          </Link>
          <a
            href="mailto:contact@gittablehub.cl"
            className="px-8 py-4 bg-transparent text-white rounded-full font-medium hover:bg-white/10 transition-all border border-white/30"
          >
            contact@gittablehub.cl
          </a>
        </div>
      </div>
    </section>
  )
}
