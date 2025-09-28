import { BookOpen, Users, Star, TrendingUp } from "lucide-react"

const stats = [
  { id: 1, name: "Books Listed", value: "50,000+", icon: BookOpen },
  { id: 2, name: "Active Users", value: "10,000+", icon: Users },
  { id: 3, name: "Average Rating", value: "4.9/5", icon: Star },
  { id: 4, name: "Books Traded", value: "25,000+", icon: TrendingUp },
]

export function TrustedBySection() {
  return (
    <section className="bg-emerald-600 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Book Lovers Worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-emerald-100">
              Join thousands of readers who have already discovered their next favorite book through BookSwap.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-white/5 p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <dt className="text-sm font-semibold leading-6 text-emerald-100">{stat.name}</dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
