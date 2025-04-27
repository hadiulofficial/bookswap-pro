import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

export default function UserProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            <div className="px-6 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4 gap-4">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800" />
                <div className="text-center sm:text-left">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <Skeleton className="h-8 w-12 mx-auto mb-2" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <Skeleton className="h-8 w-12 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="books" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="books" disabled>
                Books
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
