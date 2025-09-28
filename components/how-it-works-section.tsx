import { UserPlus, Search, Users, CheckCircle } from "lucide-react"
import Image from "next/image"

export function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your free account and set up your profile",
      image: "/online-registration.png",
    },
    {
      icon: Search,
      title: "List Your Books",
      description: "Add books you want to sell, donate, or exchange",
      image: "/online-book-listing.png",
    },
    {
      icon: Users,
      title: "Connect & Trade",
      description: "Find other readers and arrange book exchanges",
      image: "/book-exchange-park.png",
    },
    {
      icon: CheckCircle,
      title: "Enjoy Reading",
      description: "Discover new books and expand your library",
      image: "/thoughtful-reader.png",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started with BookSwap is simple and straightforward
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative mb-6">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-4 left-6 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-emerald-200 z-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
