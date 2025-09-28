import { BookOpen, Users, Award, Globe } from "lucide-react"

export function TrustedBySection() {
  const stats = [
    {
      icon: BookOpen,
      number: "50,000+",
      label: "Books Available",
    },
    {
      icon: Users,
      number: "10,000+",
      label: "Active Members",
    },
    {
      icon: Award,
      number: "25,000+",
      label: "Successful Swaps",
    },
    {
      icon: Globe,
      number: "100+",
      label: "Cities Worldwide",
    },
  ]

  return (
    <section className="py-16 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Trusted by Book Lovers Worldwide</h2>
          <p className="text-lg text-gray-600">Join our growing community of passionate readers</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
