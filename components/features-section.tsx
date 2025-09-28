import { BookOpen, Users, Repeat, Shield, Heart, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Vast Library",
      description: "Access thousands of books across all genres and categories",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with fellow book lovers in your area and beyond",
    },
    {
      icon: Repeat,
      title: "Easy Exchanges",
      description: "Simple and secure book swapping with built-in messaging",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified users and secure transactions for peace of mind",
    },
    {
      icon: Heart,
      title: "Give Back",
      description: "Donate books to spread literacy and help your community",
    },
    {
      icon: Zap,
      title: "Instant Matches",
      description: "Smart recommendations based on your reading preferences",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose BookSwap?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the largest community of book enthusiasts and discover new ways to share your love for reading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <feature.icon className="h-8 w-8 text-emerald-600" />
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
