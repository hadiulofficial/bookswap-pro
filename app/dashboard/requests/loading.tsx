import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DashboardTitle } from "@/components/dashboard/title"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <div className="p-4 md:p-6">
      <DashboardTitle>Book Requests</DashboardTitle>

      <Tabs defaultValue="incoming" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
          <TabsTrigger value="outgoing">Your Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outgoing">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RequestCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}
