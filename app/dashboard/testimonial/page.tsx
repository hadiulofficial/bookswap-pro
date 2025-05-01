import { Suspense } from "react"
import { getUserTestimonial } from "@/app/actions/testimonial-actions"
import { TestimonialForm } from "@/components/testimonial-form"
import { DashboardTitle } from "@/components/dashboard/title"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Your Review | BookSwap",
  description: "Share your experience with BookSwap",
}

async function TestimonialContent() {
  const testimonial = await getUserTestimonial()

  return (
    <div className="max-w-2xl">
      <TestimonialForm existingTestimonial={testimonial} />
    </div>
  )
}

export default function TestimonialPage() {
  return (
    <div className="space-y-6">
      <DashboardTitle
        title="Your Review"
        description="Share your experience with BookSwap to help others discover our community"
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <TestimonialContent />
      </Suspense>
    </div>
  )
}
