import { BookOpen, Heart, Repeat, DollarSign, Users, Shield } from "lucide-react"

const features = [
  {
    name: "Buy & Sell Books",
    description: "Purchase books at great prices or sell your collection to fellow book lovers.",
    icon: DollarSign,
  },
  {
    name: "Book Exchange",
    description: "Trade books directly with other users. Perfect for discovering new genres.",
    icon: Repeat,
  },
  {
    name: "Donate Books",
    description: "Share the joy of reading by donating books to those who need them most.",
    icon: Heart,
  },
  {
    name: "Community Driven",
    description: "Connect with fellow book enthusiasts and build lasting reading relationships.",
    icon: Users,
  },
  {
    name: "Secure Transactions",
    description: "Safe and secure payment processing with buyer and seller protection.",
    icon: Shield,
  },
  {
    name: "Vast Collection",
    description: "Access thousands of books across all genres, from classics to latest releases.",
    icon: BookOpen,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">Why Choose BookSwap</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to trade books
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform makes it easy to buy, sell, donate, and exchange books with a community of passionate readers.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-emerald-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
