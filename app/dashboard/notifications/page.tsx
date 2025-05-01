import { Suspense } from "react"
import { DashboardTitle } from "@/components/dashboard/title"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Notifications | BookSwap",
  description: "View and manage your notifications",
}

export default function NotificationsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <DashboardTitle title="Notifications" description="View and manage your notifications" />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="requests">Book Requests</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Suspense fallback={<NotificationsListSkeleton />}>
            <NotificationsList filter="all" />
          </Suspense>
        </TabsContent>

        <TabsContent value="unread">
          <Suspense fallback={<NotificationsListSkeleton />}>
            <NotificationsList filter="unread" />
          </Suspense>
        </TabsContent>

        <TabsContent value="requests">
          <Suspense fallback={<NotificationsListSkeleton />}>
            <NotificationsList filter="book_request" />
          </Suspense>
        </TabsContent>

        <TabsContent value="purchases">
          <Suspense fallback={<NotificationsListSkeleton />}>
            <NotificationsList filter="purchases" />
          </Suspense>
        </TabsContent>

        <TabsContent value="sales">
          <Suspense fallback={<NotificationsListSkeleton />}>
            <NotificationsList filter="sales" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
    </div>
  )
}
