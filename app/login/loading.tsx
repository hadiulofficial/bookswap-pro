import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <main className="flex-1 py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2 max-w-[600px]">
              <Skeleton className="h-12 w-80 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </main>

      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-24 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
