import { Loader2 } from "lucide-react"

export default function BooksLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <h2 className="text-xl font-medium">Loading books...</h2>
        <p className="text-gray-500">Please wait while we fetch the latest books</p>
      </div>
    </div>
  )
}
