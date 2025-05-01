import { Book, ShoppingCart, DollarSign, Bell, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  filter: string
}

export function EmptyState({ filter }: EmptyStateProps) {
  let icon = <Bell className="h-12 w-12 text-gray-300 mb-3" />
  let title = "No notifications"
  let description = "You don't have any notifications yet."

  switch (filter) {
    case "unread":
      icon = <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
      title = "No unread notifications"
      description = "You've read all your notifications."
      break
    case "book_request":
      icon = <Book className="h-12 w-12 text-gray-300 mb-3" />
      title = "No book requests"
      description = "You don't have any book request notifications."
      break
    case "purchases":
      icon = <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
      title = "No purchase notifications"
      description = "You don't have any notifications about your purchases."
      break
    case "sales":
      icon = <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
      title = "No sales notifications"
      description = "You don't have any notifications about your sales."
      break
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg bg-muted/10">
      {icon}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-md">{description}</p>
    </div>
  )
}
