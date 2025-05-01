"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Bell, Check, BookOpen, RefreshCw, Book, Inbox, ChevronRight, ShoppingCart, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notification-actions"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  related_id: string | null
  read: boolean
  created_at: string
}

export function NotificationDropdown() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Maximum number of notifications to show in dropdown
  const MAX_NOTIFICATIONS = 5

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [user?.id])

  const fetchNotifications = async () => {
    if (!user?.id) return

    setLoading(true)
    const { data, error } = await getNotifications(user.id)

    if (data && !error) {
      setNotifications(data)
    }
    setLoading(false)
  }

  const fetchUnreadCount = async () => {
    if (!user?.id) return

    const { count, error } = await getUnreadNotificationsCount(user.id)

    if (!error) {
      setUnreadCount(count)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!user?.id) return

    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id, user.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    // Navigate based on notification type
    if (notification.type === "book_request" && notification.related_id) {
      router.push(`/dashboard/requests`)
    } else if (notification.type === "request_update" && notification.related_id) {
      router.push(`/dashboard/requests`)
    } else if (notification.type === "purchase_received" && notification.related_id) {
      router.push(`/dashboard/sales`)
    } else if (notification.type === "purchase_confirmed" && notification.related_id) {
      router.push(`/dashboard/purchases`)
    } else if (notification.type === "purchase_shipped" && notification.related_id) {
      router.push(`/dashboard/purchases`)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    const { success } = await markAllNotificationsAsRead(user.id)

    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "book_request":
        return <Book className="h-4 w-4 text-emerald-500" />
      case "request_update":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "purchase_received":
        return <DollarSign className="h-4 w-4 text-amber-500" />
      case "purchase_confirmed":
        return <ShoppingCart className="h-4 w-4 text-violet-500" />
      case "purchase_shipped":
        return <ShoppingCart className="h-4 w-4 text-indigo-500" />
      default:
        return <Inbox className="h-4 w-4 text-gray-500" />
    }
  }

  const handleViewAllClick = () => {
    router.push("/dashboard/notifications")
  }

  if (!user) return null

  // Limit the number of notifications shown in the dropdown
  const displayedNotifications = notifications.slice(0, MAX_NOTIFICATIONS)
  const hasMoreNotifications = notifications.length > MAX_NOTIFICATIONS

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleMarkAllAsRead}>
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <>
            {displayedNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full">
                  <div className="mr-3 mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <p className="text-sm text-gray-500 line-clamp-2">{notification.message}</p>
                    <div className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!notification.read && <div className="ml-2 h-2 w-2 rounded-full bg-blue-500"></div>}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-center items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 py-3"
              onClick={handleViewAllClick}
            >
              View all notifications
              {hasMoreNotifications && <span className="ml-1 text-xs text-gray-500">({notifications.length})</span>}
              <ChevronRight className="ml-1 h-4 w-4" />
            </DropdownMenuItem>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <BookOpen className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">You have no notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
