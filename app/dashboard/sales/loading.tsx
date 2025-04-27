import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SalesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 flex items-center gap-6">
                  <Skeleton className="h-24 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="p-6 flex justify-between items-center">
                  <Skeleton className="h-16 w-48" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
