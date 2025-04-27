import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Title } from "@/components/dashboard/title"

export default function SwapRequestsLoading() {
  return (
    <div className="p-4 md:p-6">
      <Title>Swap Requests</Title>

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <div className="flex gap-3">
                    <Skeleton className="h-16 w-12" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <div className="flex gap-3">
                    <Skeleton className="h-16 w-12" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
