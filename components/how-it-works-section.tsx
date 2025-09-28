import { UserPlus, Search, MessageCircle, Handshake } from "lucide-react"
import Image from "next/image"

const steps = [
  {
    name: "Sign Up",
    description: "Create your free account and set up your profile in minutes.",
    icon: UserPlus,
    image: "/online-registration.png",
  },
  {
    name: "Browse & List",
    description: "Search for books you want or list your own books for others to discover.",
    icon: Search,
    image: "/online-book-listing.png",
  },
  {
    name: "Connect",
    description: "Message other users to discuss details and arrange your book transaction.",
    icon: MessageCircle,
    image: "/book-exchange-park.png",
  },
  {
    name: "Exchange",
    description: "Complete your transaction safely and enjoy your new books!",
    icon: Handshake,
    image: "/thoughtful-reader.png",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gray-50">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Start trading books in 4 simple steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Getting started with BookSwap is easy. Follow these simple steps to begin your book trading journey.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
            {steps.map((step, stepIdx) => (
              <div key={step.name} className="flex flex-col lg:flex-row lg:items-center lg:gap-x-8">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-600">
                    <step.icon className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-6 lg:mt-0 lg:flex-1">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    <span className="text-emerald-600">Step {stepIdx + 1}:</span> {step.name}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-600">{step.description}</p>
                </div>
                <div className="mt-6 lg:mt-0 lg:flex-shrink-0">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.name}
                    width={200}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
