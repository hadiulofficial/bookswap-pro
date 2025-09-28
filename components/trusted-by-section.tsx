import { BookOpen, Users, Heart, Repeat } from "lucide-react"

const stats = [
  { id: 1, name: "Books Available", value: "10,000+", icon: BookOpen },
  { id: 2, name: "Active Users", value: "5,000+", icon: Users },
  { id: 3, name: "Books Donated", value: "15,000+", icon: Heart },
  { id: 4, name: "Successful Exchanges", value: "25,000+", icon: Repeat },
]

export function TrustedBySection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">Trusted by Readers</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Join our growing community</p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            BookSwap is the preferred platform for book lovers around the world.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <stat.icon className="h-6 w-6 text-emerald-600" />
              </div>
              <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
