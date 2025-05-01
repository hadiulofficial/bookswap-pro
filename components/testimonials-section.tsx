import { getTestimonials } from "@/app/actions/testimonial-actions"
import { Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export async function TestimonialsSection() {
  const testimonials = await getTestimonials()

  // Default testimonials to use if there are no real ones
  const defaultTestimonials = [
    {
      id: "1",
      content:
        "BookSwap has completely transformed how I discover new books. The community is amazing and I've found so many hidden gems!",
      rating: 5,
      profile: {
        full_name: "Sarah Johnson",
        avatar_url: "/joyful-latina.png",
      },
    },
    {
      id: "2",
      content:
        "I've saved so much money using BookSwap while still getting to read all the books I want. The swap feature is brilliant!",
      rating: 5,
      profile: {
        full_name: "Michael Chen",
        avatar_url: "/thoughtful-young-man.png",
      },
    },
    {
      id: "3",
      content:
        "As an avid reader, BookSwap has been a game-changer. The platform is intuitive and the community is so supportive.",
      rating: 4,
      profile: {
        full_name: "David Rodriguez",
        avatar_url: "/thoughtful-reader.png",
      },
    },
  ]

  // Use real testimonials if available, otherwise use defaults
  const displayTestimonials = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Don't just take our word for it. Here's what our community has to say about BookSwap.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col justify-between space-y-4 bg-white p-6 shadow-lg rounded-lg dark:bg-gray-950"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-500 dark:text-gray-400 line-clamp-4">{testimonial.content}</p>
              </div>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.profile?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                  alt={testimonial.profile?.full_name || "User"}
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{testimonial.profile?.full_name || "Anonymous User"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/dashboard/testimonial">Share Your Experience</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
