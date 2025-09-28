import { BookOpen, Users, Heart, Award } from "lucide-react"

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
      label: "Active Users",
    },
    {
      icon: Heart,
      number: "25,000+",
      label: "Successful Swaps",
    },
    {
      icon: Award,
      number: "4.9/5",
      label: "User Rating",
    },
  ]

  return (
    <section className="py-16 bg-emerald-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by Book Lovers Worldwide</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Join our growing community of readers who are passionate about sharing knowledge and stories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-full mb-4">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-emerald-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
