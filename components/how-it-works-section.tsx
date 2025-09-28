import { UserPlus, Search, MessageCircle, Users } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your free account and set up your reading profile in minutes",
    },
    {
      icon: Search,
      title: "List Your Books",
      description: "Add books you want to sell, donate, or exchange with our easy listing tool",
    },
    {
      icon: MessageCircle,
      title: "Connect & Chat",
      description: "Message other users to arrange swaps, purchases, or donations",
    },
    {
      icon: Users,
      title: "Meet & Exchange",
      description: "Meet safely in public places or arrange secure shipping for your books",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with BookSwap is simple. Follow these four easy steps to begin your book sharing journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6 relative z-10">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-emerald-200 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
