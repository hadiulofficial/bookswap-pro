"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, BookOpen, ArrowLeft, RefreshCw, Check, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { requestBookSwap } from "@/app/actions/swap-actions"

export default function SwapRequestPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const { user } = useAuth()

  const [book, setBook] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [myBooks, setMyBooks] = useState<any[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchBookDetails()
    fetchMyBooks()
  }, [bookId, user, router])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: bookData, error: bookError } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (bookError) {
        throw bookError
      }

      if (!bookData) {
        throw new Error("Book not found")
      }

      const listingType = bookData.listing_type.toLowerCase()
      if (listingType !== "exchange" && listingType !== "swap") {
        throw new Error("This book is not available for exchange")
      }

      if (bookData.owner_id === user?.id) {
        throw new Error("You cannot swap with your own book")
      }

      const { data: ownerData, error: ownerError } = await supabase
        .from("profiles")
        .select("id, username, full_name, location, created_at")
        .eq("id", bookData.owner_id)
        .single()

      if (ownerError) {
        console.error("Error fetching owner:", ownerError)
      }

      setBook(bookData)
      setOwner(ownerData || { id: bookData.owner_id })
    } catch (err: any) {
      console.error("Error fetching book details:", err)
      setError(err.message || "Failed to load book details")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBooks = async () => {
    if (!user) {
      console.warn("fetchMyBooks called without a user.")
      return
    }

    try {
      console.log(`fetchMyBooks: Fetching books for user ID: ${user.id}`)

      const { data: allUserBooks, error: queryError } = await supabase
        .from("books")
        .select("id, title, author, cover_image, condition, listing_type, status, owner_id")
        .eq("owner_id", user.id)

      console.log("fetchMyBooks: ALL user books from database:", allUserBooks)

      if (queryError) {
        console.error("fetchMyBooks: Error querying user's books:", queryError)
        setError(`Failed to load your books: ${queryError.message}`)
        setMyBooks([])
        return
      }

      if (!allUserBooks || allUserBooks.length === 0) {
        console.log("fetchMyBooks: User has no books at all.")
        setMyBooks([])
        setError("You don't have any books listed yet. Please add a book first.")
        return
      }

      const exchangeableBooks = allUserBooks.filter((book) => {
        const isAvailable = book.status?.toLowerCase() === "available"
        const isExchangeable =
          book.listing_type?.toLowerCase().includes("exchange") || book.listing_type?.toLowerCase().includes("swap")

        console.log(
          `Book "${book.title}": status="${book.status}", listing_type="${book.listing_type}", isAvailable=${isAvailable}, isExchangeable=${isExchangeable}`,
        )

        return isAvailable && isExchangeable
      })

      console.log(
        `fetchMyBooks: Found ${exchangeableBooks.length} exchangeable books out of ${allUserBooks.length} total books`,
      )

      if (exchangeableBooks.length > 0) {
        setMyBooks(exchangeableBooks)
        if (
          error === "You don't have any books available for exchange. Please add a book first." ||
          error === "You don't have any books listed yet. Please add a book first."
        ) {
          setError(null)
        }
      } else {
        setMyBooks([])
        if (!error || error === "You don't have any books listed yet. Please add a book first.") {
          setError(
            "You don't have any books available for exchange. Please add a book with listing type 'Exchange' or 'Swap' and status 'Available'.",
          )
        }
      }
    } catch (err: any) {
      console.error("fetchMyBooks: Unexpected exception:", err)
      setError("An unexpected error occurred while loading your books.")
      setMyBooks([])
      toast({
        title: "Error Loading Books",
        description: "An unexpected issue occurred while trying to load your books for exchange.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== FORM SUBMISSION STARTED ===")
    console.log("Form submitted with selectedBookId:", selectedBookId)
    console.log("User ID:", user?.id)
    console.log("Book ID:", bookId)
    console.log("Message:", message)

    if (!user) {
      console.error("No user found")
      toast({
        title: "Authentication required",
        description: "Please sign in to request a swap",
        variant: "destructive",
      })
      return
    }

    if (!selectedBookId || selectedBookId === "") {
      console.error("No book selected")
      toast({
        title: "Book required",
        description: "Please select a book to offer for swap",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      console.log("Calling requestBookSwap with:", {
        userId: user.id,
        requestedBookId: bookId,
        offeredBookId: selectedBookId,
        message: message,
      })

      const result = await requestBookSwap(user.id, bookId, selectedBookId, message)

      console.log("=== SWAP REQUEST RESULT ===")
      console.log("Result:", result)

      if (result.success) {
        console.log("Swap request successful, swap ID:", result.swapId)
        toast({
          title: "Swap Request Sent Successfully!",
          description: "The book owner has been notified. Check your swaps dashboard for updates.",
          duration: 5000,
        })

        // Wait a bit for the toast to be visible, then redirect
        setTimeout(() => {
          console.log("Redirecting to /dashboard/swaps")
          router.push("/dashboard/swaps")
        }, 1000)
      } else {
        console.error("Swap request failed:", result.error)
        toast({
          title: "Request Failed",
          description: result.error || "Failed to send swap request. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
        setSubmitting(false)
      }
    } catch (err: any) {
      console.error("=== EXCEPTION DURING FORM SUBMISSION ===")
      console.error("Error requesting swap:", err)
      console.error("Error stack:", err.stack)
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      setSubmitting(false)
    }
  }

  const handleBookSelect = (bookIdToSelect: string) => {
    console.log("handleBookSelect called with bookId:", bookIdToSelect)
    console.log("Previous selectedBookId:", selectedBookId)
    setSelectedBookId(bookIdToSelect)
    console.log("New selectedBookId set to:", bookIdToSelect)

    // Show toast to confirm selection
    toast({
      title: "Book Selected",
      description: "Click 'Request Swap' to send your request",
      duration: 2000,
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">You must be logged in to request a swap</h1>
            <Button onClick={() => router.push("/login")}>Log In</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6 flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-emerald-600" /> Request Book Swap
              </h1>

              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Unable to proceed with swap</p>
                    <p className="text-sm mt-1">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-transparent"
                      onClick={() => router.push("/dashboard/books/add")}
                    >
                      Add a Book
                    </Button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                  <p className="text-gray-500 text-sm">Loading book details...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-8">
                    {/* Book you want section */}
                    <div>
                      <h2 className="text-lg font-medium mb-4">Book You Want</h2>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              {book.cover_image ? (
                                <div className="relative w-24 h-36 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    src={book.cover_image || "/placeholder.svg"}
                                    alt={`Cover for ${book.title}`}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                  />
                                </div>
                              ) : (
                                <div className="flex w-24 h-36 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-2">
                                  <BookOpen className="h-8 w-8 text-gray-400" />
                                  <p className="text-xs text-gray-500">No cover</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold">{book.title}</h3>
                              <p className="text-gray-600">By {book.author}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{book.condition}</Badge>
                                <Badge variant="secondary">Exchange</Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                Owner: {owner?.full_name || owner?.username || "Anonymous"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Book you're offering section */}
                    <div>
                      <h2 className="text-lg font-medium mb-4">Book You're Offering</h2>
                      {myBooks.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
                          <p className="font-medium">You don't have any books available for exchange</p>
                          <p className="text-sm mt-1">Add a book with listing type "Exchange" first.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-3 bg-transparent"
                            onClick={() => router.push("/dashboard/books/add")}
                          >
                            Add a Book
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myBooks.map((bookItem) => {
                            const isSelected = selectedBookId === bookItem.id

                            return (
                              <button
                                key={bookItem.id}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleBookSelect(bookItem.id)
                                }}
                                className={`relative text-left rounded-lg border-2 p-4 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0">
                                    {bookItem.cover_image ? (
                                      <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                        <Image
                                          src={bookItem.cover_image || "/placeholder.svg"}
                                          alt={`Cover for ${bookItem.title}`}
                                          fill
                                          className="object-cover"
                                          sizes="64px"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex w-16 h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-1">
                                        <BookOpen className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium line-clamp-1">{bookItem.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-1">By {bookItem.author}</p>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {bookItem.condition}
                                    </Badge>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-2 right-2 h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {selectedBookId && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-emerald-700">
                            Book selected! Fill in the message below (optional) and click "Request Swap" to continue.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Message section */}
                    <div>
                      <Label htmlFor="message" className="text-lg font-medium block mb-2">
                        Message to Owner (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Write a message to the book owner..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px]"
                        disabled={submitting}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Let the owner know why you're interested in swapping or any other details.
                      </p>
                    </div>

                    {/* Submit button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={submitting}
                        className="sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || myBooks.length === 0 || !selectedBookId || selectedBookId === ""}
                        className="sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Request...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
