import { DashboardShell } from "@/components/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Messages" text="Communicate with other BookSwap users" />
      <div className="grid gap-8">
        <div className="grid gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </DashboardShell>
  )
}
