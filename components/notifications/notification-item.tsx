"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Book, RefreshCw, Inbox, Check, ShoppingCart, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "book_request":
        return <Book className="h-5 w-5 text-emerald-500" />
      case "request_update":
        return <RefreshCw className="h-5 w-5 text-blue-500" />
      case "purchase_received":
        return <DollarSign className="h-5 w-5 text-amber-500" />
      case "purchase_confirmed":
        return <ShoppingCart className="h-5 w-5 text-violet-500" />
      case "purchase_shipped":
        return <ShoppingCart className="h-5 w-5 text-indigo-500" />
      default:
        return <Inbox className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "book_request":
        return "bg-emerald-100"
      case "request_update":
        return "bg-blue-100"
      case "purchase_received":
        return "bg-amber-100"
      case "purchase_confirmed":
        return "bg-violet-100"
      case "purchase_shipped":
        return "bg-indigo-100"
      default:
        return "bg-gray-100"
    }
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
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

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification.id)
  }

  return (
    <div
      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
        !notification.read ? "bg-muted/50 border-muted-foreground/20" : "hover:bg-muted/20"
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${getNotificationColor(notification.type)} mr-4`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-base">{notification.title}</h4>
          {!notification.read && isHovered && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleMarkAsRead}>
              <Check className="h-3 w-3 mr-1" />
              Mark as read
            </Button>
          )}
          {!notification.read && !isHovered && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>}
        </div>

        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

        <div className="mt-2 text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
