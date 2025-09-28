import { Star } from "lucide-react"

const testimonials = [
  {
    body: "BookSwap has completely changed how I discover new books. I've found amazing reads and made great friends in the process!",
    author: {
      name: "Sarah Johnson",
      handle: "sarahj",
      imageUrl: "/thoughtful-young-man.png",
    },
    rating: 5,
  },
  {
    body: "As a college student, BookSwap has saved me hundreds of dollars on textbooks. The community is incredibly helpful and trustworthy.",
    author: {
      name: "Michael Chen",
      handle: "mchen",
      imageUrl: "/joyful-latina.png",
    },
    rating: 5,
  },
  {
    body: "I love how easy it is to find rare books that I've been searching for years. The platform is intuitive and the people are wonderful.",
    author: {
      name: "Emily Rodriguez",
      handle: "emilyrod",
      imageUrl: "/thoughtful-reader.png",
    },
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-emerald-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Users Say</p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div key={testimonialIdx} className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                <div className="flex gap-x-1 text-emerald-600 mb-6">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-5 w-5 flex-none ${rating < testimonial.rating ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-gray-900">
                  <p>"{testimonial.body}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <img
                    className="h-10 w-10 rounded-full bg-gray-50"
                    src={testimonial.author.imageUrl || "/placeholder.svg"}
                    alt=""
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
