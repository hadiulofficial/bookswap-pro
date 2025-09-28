import { BookOpen, Users, Repeat, Heart } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Vast Collection",
      description: "Access thousands of books across all genres and categories",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with fellow book lovers in your local area",
    },
    {
      icon: Repeat,
      title: "Easy Exchange",
      description: "Simple and secure book swapping process",
    },
    {
      icon: Heart,
      title: "Sustainable Reading",
      description: "Give books a second life and reduce waste",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose BookSwap?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join a community that believes every book deserves a second chance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6 group-hover:bg-emerald-200 transition-colors">
                <feature.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
