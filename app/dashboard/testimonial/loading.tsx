import { Shell } from "@/components/shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function TestimonialLoading() {
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px] mt-2" />
        </div>
        <div className="max-w-2xl mx-auto w-full">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </Shell>
  )
}
