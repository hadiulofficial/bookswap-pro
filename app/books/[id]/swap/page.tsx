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
import { Loader2, BookOpen, ArrowLeft, RefreshCw, Check, AlertCircle, CheckCircle, Info } from "lucide-react"
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
  const [allMyBooks, setAllMyBooks] = useState<any[]>([])
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

      console.log("Fetching book details for bookId:", bookId)
      const { data: bookData, error: bookError } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (bookError) {
        console.error("Error fetching book:", bookError)
        throw bookError
      }

      if (!bookData) {
        throw new Error("Book not found")
      }

      console.log("Book data fetched:", bookData)

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
      console.log(`=== FETCHING USER'S BOOKS ===`)
      console.log(`User ID: ${user.id}`)

      // First, get ALL books for this user (no filters)
      const { data: allBooks, error: queryError } = await supabase
        .from("books")
        .select("id, title, author, cover_image, condition, listing_type, status, owner_id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      console.log("Query error:", queryError)
      console.log("All books fetched:", allBooks)

      if (queryError) {
        console.error("Error querying user's books:", queryError)
        toast({
          title: "Error Loading Books",
          description: queryError.message,
          variant: "destructive",
        })
        setMyBooks([])
        setAllMyBooks([])
        return
      }

      if (!allBooks || allBooks.length === 0) {
        console.log("User has no books at all.")
        setMyBooks([])
        setAllMyBooks([])
        setError("You don't have any books listed yet. Please add a book first.")
        return
      }

      setAllMyBooks(allBooks)
      console.log(`Total books found: ${allBooks.length}`)

      // Log each book's details
      allBooks.forEach((book, index) => {
        console.log(`Book ${index + 1}:`, {
          title: book.title,
          status: book.status,
          listing_type: book.listing_type,
        })
      })

      // Filter for available books
      const availableBooks = allBooks.filter((book) => book.status?.toLowerCase() === "available")
      console.log(`Available books: ${availableBooks.length}`)

      if (availableBooks.length === 0) {
        console.log("No available books found")
        setMyBooks([])
        setError(
          `You have ${allBooks.length} book(s) but none are available for swapping. Please check your books' status.`,
        )
        return
      }

      // Filter for exchangeable books
      const exchangeableBooks = availableBooks.filter((book) => {
        const listingType = (book.listing_type || "").toLowerCase().trim()
        const isExchangeable =
          listingType === "exchange" ||
          listingType === "swap" ||
          listingType.includes("exchange") ||
          listingType.includes("swap")

        console.log(`Checking "${book.title}":`, {
          listingType: book.listing_type,
          normalized: listingType,
          isExchangeable,
        })

        return isExchangeable
      })

      console.log(`=== FILTERING RESULTS ===`)
      console.log(`Total books: ${allBooks.length}`)
      console.log(`Available books: ${availableBooks.length}`)
      console.log(`Exchangeable books: ${exchangeableBooks.length}`)

      if (exchangeableBooks.length > 0) {
        setMyBooks(exchangeableBooks)
        setError(null)
        console.log("Exchangeable books set successfully")
      } else {
        setMyBooks([])

        // Provide helpful guidance based on what books they have
        const unavailableCount = allBooks.length - availableBooks.length
        const nonExchangeableCount = availableBooks.length - exchangeableBooks.length

        let errorMessage = ""
        if (unavailableCount > 0 && nonExchangeableCount > 0) {
          errorMessage = `You have ${allBooks.length} book(s), but ${unavailableCount} are not available and ${nonExchangeableCount} are not listed for exchange/swap. Please edit your books to make them available and change listing type to "Exchange" or "Swap".`
        } else if (unavailableCount > 0) {
          errorMessage = `You have ${unavailableCount} book(s) that are not available. Please change their status to "Available" to use them for swapping.`
        } else if (nonExchangeableCount > 0) {
          errorMessage = `You have ${nonExchangeableCount} available book(s) but they are not listed for exchange/swap. Please change their listing type to "Exchange" or "Swap".`
        } else {
          errorMessage = "You don't have any books available for exchange. Please add a book first."
        }

        console.log("Setting error:", errorMessage)
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error("=== EXCEPTION IN FETCH MY BOOKS ===")
      console.error("Error:", err)
      console.error("Stack:", err.stack)
      setError("An unexpected error occurred while loading your books.")
      setMyBooks([])
      setAllMyBooks([])
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

    const selectedBook = myBooks.find((b) => b.id === selectedBookId)
    if (selectedBook) {
      console.log("Selected book details:", {
        id: selectedBook.id,
        title: selectedBook.title,
        listing_type: selectedBook.listing_type,
        status: selectedBook.status,
      })
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

    const selectedBook = myBooks.find((b) => b.id === bookIdToSelect)
    if (selectedBook) {
      console.log("Selected book details:", {
        title: selectedBook.title,
        listing_type: selectedBook.listing_type,
        status: selectedBook.status,
      })
    }

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
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Unable to proceed with swap</p>
                      <p className="text-sm mt-1">{error}</p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => router.push("/dashboard/books/add")}
                        >
                          Add a Book
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => router.push("/dashboard/books")}
                        >
                          View My Books
                        </Button>
                      </div>
                    </div>
                  </div>

                  {allMyBooks.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium mb-2">Your Books Summary:</p>
                          <ul className="text-sm space-y-1">
                            <li>• Total books: {allMyBooks.length}</li>
                            <li>
                              • Available for swap:{" "}
                              {
                                allMyBooks.filter((b) => {
                                  const listingType = (b.listing_type || "").toLowerCase()
                                  return (
                                    b.status === "available" &&
                                    (listingType.includes("exchange") || listingType.includes("swap"))
                                  )
                                }).length
                              }
                            </li>
                          </ul>
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">To make a book swappable:</p>
                            <ol className="text-sm space-y-1 ml-4 list-decimal">
                              <li>Status must be "Available"</li>
                              <li>Listing Type must be "Exchange" or "Swap"</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                  <p className="text-gray-500 text-sm">Loading book details...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-8">
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
                                  <p className="text-xs text-gray-500 mt-1">No cover</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold">{book.title}</h3>
                              <p className="text-gray-600">By {book.author}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{book.condition}</Badge>
                                <Badge variant="secondary">{book.listing_type}</Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                Owner: {owner?.full_name || owner?.username || "Anonymous"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium mb-4">Book You're Offering</h2>
                      {myBooks.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
                          <p className="font-medium">No books available for exchange</p>
                          <p className="text-sm mt-1">
                            You need books with listing type "Exchange" or "Swap" and status "Available" to make swap
                            requests.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() => router.push("/dashboard/books/add")}
                            >
                              Add a Book
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() => router.push("/dashboard/books")}
                            >
                              Edit Existing Books
                            </Button>
                          </div>
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
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {bookItem.condition}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {bookItem.listing_type}
                                      </Badge>
                                    </div>
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
