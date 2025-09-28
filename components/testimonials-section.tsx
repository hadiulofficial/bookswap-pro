import { Star } from "lucide-react"
import Image from "next/image"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Book Enthusiast",
      image: "/thoughtful-reader.png",
      rating: 5,
      text: "BookSwap has completely transformed how I discover new books. I've found amazing reads and made great friends in the process!",
    },
    {
      name: "Michael Chen",
      role: "College Student",
      image: "/thoughtful-young-man.png",
      rating: 5,
      text: "As a student, BookSwap helps me save money on textbooks while connecting with other readers. It's a win-win!",
    },
    {
      name: "Maria Rodriguez",
      role: "Teacher",
      image: "/joyful-latina.png",
      rating: 5,
      text: "I love how easy it is to donate books to students who need them. BookSwap makes giving back so simple and rewarding.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied readers who have found their perfect book matches through BookSwap
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
