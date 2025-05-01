import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { StarIcon } from "lucide-react"

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 md:mb-16">
          <div className="space-y-3 max-w-[800px]">
            <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Don't just take our word for it. Here's what BookSwap users have to say about their experience.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <TestimonialCard
            name="Sarah Johnson"
            role="Book Club Organizer"
            avatar="/thoughtful-reader.png"
            content="BookSwap has transformed how our book club operates. We can easily exchange books and discover new titles together."
            rating={5}
          />
          <TestimonialCard
            name="Michael Chen"
            role="College Student"
            avatar="/thoughtful-young-man.png"
            content="As a student on a budget, BookSwap has saved me hundreds of dollars on textbooks and novels for my literature classes."
            rating={5}
          />
          <TestimonialCard
            name="Emily Rodriguez"
            role="Avid Reader"
            avatar="/joyful-latina.png"
            content="I've connected with so many fellow book lovers in my area. My bookshelf is now constantly refreshed with new reads!"
            rating={4}
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ name, role, avatar, content, rating }) {
  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-0">
        <div className="flex gap-1">
          {Array(rating)
            .fill(null)
            .map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 fill-emerald-500 text-emerald-500" />
            ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <p className="text-gray-500 dark:text-gray-400">"{content}"</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
