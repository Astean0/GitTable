export default function FAQSection() {
  const faqs = [
    {
      q: 'What services does your company offer?',
      a: 'If a university pays for Premium, our system generates schedules with zero conflicts. We provide automated scheduling solutions that optimize room usage, professor allocation, and student time.',
    },
    {
      q: 'What happens if I have a technical problem?',
      a: 'If we have a technical problem, we will resolve it as soon as possible. Our dedicated support team monitors the platform 24/7 and responds within minutes.',
    },
    {
      q: 'If I sign up, what will I get?',
      a: 'If you sign up, you will get access to the dashboard where you can manage universities, careers, courses, and build schedules with drag & drop.',
    },
    {
      q: 'What happens if your website goes down?',
      a: 'If the website goes down, we try to recover immediately. Our infrastructure includes automatic failover systems to minimize any downtime.',
    },
    {
      q: 'What will you do if a client is not satisfied?',
      a: 'If the client is not satisfied with the schedule results, we will send a dedicated software architect to tweak the parameters. Your satisfaction is our priority.',
    },
  ]

  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-500">
            A mobile app will be launched in 2026. Our platform will be expanded to other
            regions of Chile.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-200 rounded-2xl overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">
                  +
                </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
