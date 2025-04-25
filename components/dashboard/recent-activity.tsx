import { RefreshCw } from "lucide-react"

export function RecentActivityCard() {
  // This would normally fetch real activity data
  const hasActivity = false

  if (!hasActivity) {
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

  return <div className="space-y-4">{/* Activity items would go here */}</div>
}
