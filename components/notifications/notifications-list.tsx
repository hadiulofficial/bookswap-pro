"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notification-actions"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Check, RefreshCcw } from "lucide-react"
import { EmptyState } from "@/components/notifications/empty-state"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  related_id: string | null
  read: boolean
  created_at: string
}

interface NotificationsListProps {
  filter: "all" | "unread" | "book_request" | "request_update"
}

export function NotificationsList({ filter }: NotificationsListProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id, filter])

  const fetchNotifications = async () => {
    if (!user?.id) return

    setLoading(true)
    const { data, error } = await getNotifications(user.id)

    if (data && !error) {
      let filteredData = data

      // Apply filters
      if (filter === "unread") {
        filteredData = data.filter((n) => !n.read)
      } else if (filter === "book_request") {
        filteredData = data.filter((n) => n.type === "book_request")
      } else if (filter === "request_update") {
        filteredData = data.filter((n) => n.type === "request_update")
      }

      setNotifications(filteredData)
    }
    setLoading(false)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return

    const { success } = await markNotificationAsRead(notificationId, user.id)

    if (success) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    const { success } = await markAllNotificationsAsRead(user.id)

    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading notifications...</p>
  }

  if (notifications.length === 0) {
    return <EmptyState filter={filter} />
  }

  const hasUnreadNotifications = notifications.some((n) => !n.read)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {hasUnreadNotifications && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
        ))}
      </div>
    </div>
  )
}
