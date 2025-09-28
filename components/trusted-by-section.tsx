import { BookOpen, Users, Star, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Books Listed",
    value: "50,000+",
    icon: BookOpen,
    description: "Active book listings across all genres",
  },
  {
    name: "Active Users",
    value: "10,000+",
    icon: Users,
    description: "Book lovers using our platform daily",
  },
  {
    name: "Average Rating",
    value: "4.9/5",
    icon: Star,
    description: "User satisfaction rating",
  },
  {
    name: "Books Exchanged",
    value: "100,000+",
    icon: TrendingUp,
    description: "Successful book transactions completed",
  },
]

export function TrustedBySection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">Trusted by Readers</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join a thriving community of book lovers
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            BookSwap has become the go-to platform for readers who want to share their love of books with others.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <stat.icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <dt className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{stat.value}</dt>
                <dd className="text-base font-semibold leading-7 text-gray-900 mb-1">{stat.name}</dd>
                <dd className="text-sm leading-6 text-gray-600">{stat.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
