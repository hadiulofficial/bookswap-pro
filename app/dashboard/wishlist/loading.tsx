import { DashboardTitle } from "@/components/dashboard/title"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart } from "lucide-react"

export default function WishlistLoading() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardTitle
        title="My Wishlist"
        description="Books you're interested in"
        icon={<Heart className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
