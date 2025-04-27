import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardTitle } from "@/components/dashboard/title"

export default function SwapsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader heading="Book Swaps" text="Manage your book swap requests" />
      <DashboardTitle>Incoming Swap Requests</DashboardTitle>
      <div className="grid gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-4 flex-1">
                  <Skeleton className="h-24 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="flex gap-4 flex-1">
                  <Skeleton className="h-24 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          ))}
      </div>

      <DashboardTitle>Outgoing Swap Requests</DashboardTitle>
      <div className="grid gap-4">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-4 flex-1">
                  <Skeleton className="h-24 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="flex gap-4 flex-1">
                  <Skeleton className="h-24 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
