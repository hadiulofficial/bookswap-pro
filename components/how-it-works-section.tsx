import { Upload, Search, Users, CheckCircle } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "List Your Books",
      description: "Upload photos and details of books you want to sell, donate, or swap.",
    },
    {
      icon: Search,
      title: "Discover Books",
      description: "Browse through thousands of books or search for specific titles you want.",
    },
    {
      icon: Users,
      title: "Connect with Others",
      description: "Message book owners to negotiate prices or arrange swaps and donations.",
    },
    {
      icon: CheckCircle,
      title: "Complete the Trade",
      description: "Meet up locally or arrange shipping to complete your book transaction.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How BookSwap Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started is simple. Follow these four easy steps to begin your book trading journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
