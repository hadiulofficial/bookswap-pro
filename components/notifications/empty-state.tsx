import { BookOpen, Bell, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  filter: "all" | "unread" | "book_request" | "request_update"
}

export function EmptyState({ filter }: EmptyStateProps) {
  let icon = <Bell className="h-12 w-12 text-gray-300" />
  let title = "No notifications"
  let description = "You don't have any notifications yet."

  switch (filter) {
    case "unread":
      icon = <Bell className="h-12 w-12 text-gray-300" />
      title = "No unread notifications"
      description = "You've read all your notifications."
      break
    case "book_request":
      icon = <BookOpen className="h-12 w-12 text-gray-300" />
      title = "No book requests"
      description = "You don't have any book request notifications."
      break
    case "request_update":
      icon = <AlertCircle className="h-12 w-12 text-gray-300" />
      title = "No request updates"
      description = "You don't have any request update notifications."
      break
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  )
}
