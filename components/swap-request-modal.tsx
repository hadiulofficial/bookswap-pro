"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BookOpen, RefreshCw, Loader2, AlertCircle, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserBooksForSwap, createSwapRequest } from "@/app/actions/swap-actions"
import { toast } from "@/components/ui/use-toast"

interface SwapRequestModalProps {
  isOpen: boolean
  onClose: () => void
  requestedBook: {
    id: string
    title: string
    author: string
    cover_image: string | null
    owner_id: string
  }
  userId: string
}

export function SwapRequestModal({ isOpen, onClose, requestedBook, userId }: SwapRequestModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userBooks, setUserBooks] = useState<any[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserBooks()
    }
  }, [isOpen, userId])

  const fetchUserBooks = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getUserBooksForSwap(userId)

      if (result.success) {
        setUserBooks(result.books)
      } else {
        setError(result.error || "Failed to load your books")
      }
    } catch (err: any) {
      console.error("Error fetching user books:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBookId) {
      toast({
        title: "No book selected",
        description: "Please select a book to offer for swap",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const result = await createSwapRequest(requestedBook.id, selectedBookId, userId, requestedBook.owner_id)

      if (result.success) {
        toast({
          title: "Swap Request Sent Successfully!",
          description: "The book owner will be notified of your request.",
        })
        onClose()
        router.refresh()
      } else {
        toast({
          title: "Failed to send swap request",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error creating swap request:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Request Book Swap</DialogTitle>
          <DialogDescription>
            Select one of your books to offer in exchange for &quot;{requestedBook.title}&quot;
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-gray-500 text-sm">Loading your books...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
            <p className="text-gray-700 font-medium mb-1">Failed to load your books</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchUserBooks}>
              Try Again
            </Button>
          </div>
        ) : userBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-8 w-8 text-gray-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">You have no eligible books to offer for swap</p>
            <p className="text-gray-500 text-sm mb-4">
              List some of your books for exchange to be able to request swaps.
            </p>
            <Button onClick={() => router.push("/dashboard/books/add")}>List a Book</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="mb-4 p-4 bg-gray-50 rounded-md flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-24 relative rounded overflow-hidden border border-gray-200">
                {requestedBook.cover_image ? (
                  <Image
                    src={requestedBook.cover_image || "/placeholder.svg"}
                    alt={requestedBook.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm">{requestedBook.title}</h4>
                <p className="text-gray-500 text-xs">by {requestedBook.author}</p>
              </div>
            </div>

            <h3 className="font-medium text-sm mb-3">Select a book to offer:</h3>

            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userBooks.map((book) => (
                  <div
                    key={book.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedBookId === book.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedBookId(book.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-16 relative rounded overflow-hidden border border-gray-200">
                        {book.cover_image ? (
                          <Image
                            src={book.cover_image || "/placeholder.svg"}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{book.title}</h4>
                        <p className="text-gray-500 text-xs truncate">by {book.author}</p>
                        <p className="text-xs text-gray-500 mt-1">Condition: {book.condition}</p>
                      </div>
                      {selectedBookId === book.id && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || submitting || userBooks.length === 0 || !selectedBookId}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending Request...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Confirm Swap Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
