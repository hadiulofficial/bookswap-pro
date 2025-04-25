import { RefreshCw, BookOpen, MessageSquare } from "lucide-react"

export function RecentActivityCard() {
  // This would normally fetch real activity data
  const activities = [
    {
      title: "New swap request",
      description: "Jane Smith wants to swap 'The Great Gatsby'",
      time: "2 hours ago",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Book listed",
      description: "You listed 'To Kill a Mockingbird'",
      time: "Yesterday",
      icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: "New message",
      description: "Michael Brown sent you a message",
      time: "2 days ago",
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "Swap completed",
      description: "Swap with Alex Johnson completed",
      time: "1 week ago",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
    },
  ]

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <RefreshCw className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium">No recent activity</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your recent interactions will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">{activity.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
