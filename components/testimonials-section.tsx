import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    body: "BookSwap has completely transformed how I discover new books. The community is amazing and I've found so many hidden gems through exchanges.",
    author: {
      name: "Sarah Johnson",
      handle: "sarahreads",
      imageUrl: "/thoughtful-young-man.png",
    },
    rating: 5,
  },
  {
    body: "I love being able to donate books I've finished reading. It feels great knowing they'll bring joy to other readers instead of collecting dust.",
    author: {
      name: "Michael Chen",
      handle: "bookworm_mike",
      imageUrl: "/joyful-latina.png",
    },
    rating: 5,
  },
  {
    body: "The buying and selling feature is fantastic. I've saved so much money on textbooks and rare editions. Highly recommend!",
    author: {
      name: "Emily Rodriguez",
      handle: "emily_books",
      imageUrl: "/thoughtful-reader.png",
    },
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">What Our Users Say</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by book enthusiasts worldwide
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div key={testimonialIdx} className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                <div className="flex gap-x-1 text-emerald-600 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-900">
                  <p>"{testimonial.body}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <Image
                    className="h-10 w-10 rounded-full bg-gray-50"
                    src={testimonial.author.imageUrl || "/placeholder.svg"}
                    alt={testimonial.author.name}
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                    <div className="text-gray-600">@{testimonial.author.handle}</div>
                  </div>
                </figcaption>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
