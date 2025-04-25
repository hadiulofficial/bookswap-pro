export function BookStatsCard() {
  // This would normally fetch real book stats
  const bookStats = [
    { category: "Fiction", count: 12, color: "bg-emerald-500" },
    { category: "Non-Fiction", count: 5, color: "bg-blue-500" },
    { category: "Science Fiction", count: 3, color: "bg-purple-500" },
    { category: "Biography", count: 2, color: "bg-amber-500" },
    { category: "Other", count: 2, color: "bg-gray-500" },
  ]

  const totalBooks = bookStats.reduce((sum, stat) => sum + stat.count, 0)

  if (bookStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <h3 className="mt-4 text-sm font-medium">No books listed yet</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add books to see statistics about your collection
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookStats.map((stat, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">{stat.category}</span>
            <span className="text-sm font-medium">{stat.count}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${stat.color}`} style={{ width: `${(stat.count / totalBooks) * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}
