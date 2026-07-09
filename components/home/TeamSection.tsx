export default function TeamSection() {
  const team = [
    { name: 'Jair Alva', role: 'Frontend Developer', bio: 'Designs intuitive interfaces that make scheduling simple and accessible for all users.' },
    { name: 'Jairo Rios', role: 'Backend Developer', bio: 'Implements the core algorithm and optimization logic that powers GitTableHub.' },
    { name: 'Benjamin Leiva', role: 'Software Architect', bio: 'Designs scalable system architecture ensuring reliability and performance at scale.' },
    { name: 'Gustavo Mamani', role: 'Cybersecurity Analyst', bio: 'Protects sensitive educational data with enterprise-grade security protocols.' },
  ]

  return (
    <section id="team" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Meet the Team
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The people behind GitTableHub
          </h2>
          <p className="text-lg text-gray-500">
            Specialized professionals building the future of university scheduling.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 mb-4">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm font-medium text-blue-600 mb-2">{member.role}</p>
              <p className="text-sm text-gray-500">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}