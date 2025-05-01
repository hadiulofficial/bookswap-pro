import { Suspense } from "react"
import { getUserTestimonial } from "@/app/actions/testimonial-actions"
import { TestimonialForm } from "@/components/testimonial-form"
import { Shell } from "@/components/shell"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Your Review | BookSwap",
  description: "Share your experience with BookSwap",
}

async function TestimonialContent() {
  const testimonial = await getUserTestimonial()

  return (
    <div className="max-w-2xl mx-auto">
      <TestimonialForm existingTestimonial={testimonial} />
    </div>
  )
}

export default function TestimonialPage() {
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Review</h1>
          <p className="text-muted-foreground">
            Share your experience with BookSwap to help others discover our community
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <TestimonialContent />
        </Suspense>
      </div>
    </Shell>
  )
}
