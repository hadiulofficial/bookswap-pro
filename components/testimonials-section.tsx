import Image from "next/image"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Book Enthusiast",
      image: "/thoughtful-young-man.png",
      rating: 5,
      text: "BookSwap has completely transformed how I discover new books. I've found amazing reads and made great connections with fellow book lovers in my area.",
    },
    {
      name: "Michael Chen",
      role: "Teacher",
      image: "/joyful-latina.png",
      rating: 5,
      text: "As a teacher, I love how BookSwap helps me find educational materials for my classroom while giving my old books a new purpose. It's sustainable and community-driven.",
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      image: "/thoughtful-reader.png",
      rating: 5,
      text: "Being a student on a budget, BookSwap has been a lifesaver. I can exchange textbooks and find affordable reads without breaking the bank.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied readers who have found their next favorite book
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4"
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
