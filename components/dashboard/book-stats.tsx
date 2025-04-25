export function BookStatsCard() {
  // This would normally fetch real book stats
  const hasBooks = false

  if (!hasBooks) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <h3 className="mt-4 text-sm font-medium">No books listed yet</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add books to see statistics about your collection
        </p>
      </div>
    )
  }

  return <div className="space-y-4">{/* Book stats would go here */}</div>
}
