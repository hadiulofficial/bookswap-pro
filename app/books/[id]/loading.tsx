import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function BookDetailsLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Book cover skeleton */}
                <div className="flex-shrink-0">
                  <Skeleton className="w-full md:w-80 h-96 rounded-md" />
                </div>

                {/* Book details skeleton */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>

                  <div className="pt-4">
                    <Skeleton className="h-10 w-full md:w-1/2" />
                  </div>
                </div>
              </div>

              {/* Additional details skeleton */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
