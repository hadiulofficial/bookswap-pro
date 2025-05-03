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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, BookOpen, ArrowLeft, RefreshCw, Check, AlertCircle, PlusCircle } from "lucide-react"
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
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/books/${bookId}/swap`))
      return
    }

    fetchBookDetails()
    fetchMyBooks()
  }, [bookId, user, router])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch the book first
      const { data: bookData, error: bookError } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (bookError) {
        throw bookError
      }

      if (!bookData) {
        throw new Error("Book not found")
      }

      // Check if book is available
      if (bookData.status !== "available") {
        throw new Error("This book is no longer available for exchange")
      }

      // Check if book is available for exchange - use case insensitive comparison
      const listingType = bookData.listing_type.toLowerCase()
      if (listingType !== "exchange" && listingType !== "swap") {
        throw new Error("This book is not available for exchange")
      }

      // Check if user is not the owner
      if (bookData.owner_id === user?.id) {
        throw new Error("You cannot swap with your own book")
      }

      // Now fetch the owner's profile separately
      const { data: ownerData, error: ownerError } = await supabase
        .from("profiles")
        .select("id, username, full_name, location, created_at")
        .eq("id", bookData.owner_id)
        .single()

      if (ownerError) {
        console.error("Error fetching owner:", ownerError)
        // Continue even if owner fetch fails
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
    if (!user) return

    try {
      // Use a more flexible approach to find swappable books
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "available")
        .or("listing_type.ilike.%exchange%,listing_type.ilike.%swap%")
        .order("created_at", { ascending: false })

      console.log("Exchange books query result:", data)

      if (error) {
        throw error
      }

      // If no books are found, set error message
      if (!data || data.length === 0) {
        console.log("No books found for exchange")
        setMyBooks([])
        setError("You don't have any books available for exchange. Please add a book first.")
      } else {
        setMyBooks(data)
        setError(null)
      }
    } catch (err: any) {
      console.error("Error fetching my books:", err)
      setMyBooks([])
      setError("Failed to load your books. Please try again later.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request a swap",
        variant: "destructive",
      })
      return
    }

    if (!selectedBookId) {
      toast({
        title: "Book required",
        description: "Please select a book to offer for swap",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const result = await requestBookSwap(user.id, bookId, selectedBookId, message)

      if (result.success) {
        toast({
          title: "Swap Request Sent",
          description: "Your swap request has been sent to the book owner",
        })
        router.push("/dashboard/swaps")
      } else {
        toast({
          title: "Request Failed",
          description: result.error || "Failed to send swap request",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error requesting swap:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">You must be logged in to request a swap</h1>
            <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/books/${bookId}/swap`)}`)}>
              Log In
            </Button>
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
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/books/add")}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add a Book for Exchange
                      </Button>
                    </div>
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
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => router.push("/dashboard/books/add")}
                          >
                            Add a Book
                          </Button>
                        </div>
                      ) : (
                        <RadioGroup
                          value={selectedBookId || ""}
                          onValueChange={setSelectedBookId}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {myBooks.map((book) => (
                            <div key={book.id} className="relative">
                              <RadioGroupItem value={book.id} id={book.id} className="peer sr-only" />
                              <Label
                                htmlFor={book.id}
                                className="block cursor-pointer rounded-lg border-2 border-gray-200 p-4 hover:border-gray-300 peer-checked:border-emerald-500 peer-checked:ring-1 peer-checked:ring-emerald-500"
                              >
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0">
                                    {book.cover_image ? (
                                      <div className="relative w-16 h-24 overflow-hidden rounded-md border border-gray-200">
                                        <Image
                                          src={book.cover_image || "/placeholder.svg"}
                                          alt={`Cover for ${book.title}`}
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
                                  <div>
                                    <h3 className="font-medium line-clamp-1">{book.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-1">By {book.author}</p>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {book.condition}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="absolute top-2 right-2 h-5 w-5 text-emerald-600 opacity-0 peer-checked:opacity-100">
                                  <Check className="h-5 w-5" />
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
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
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Let the owner know why you're interested in swapping or any other details.
                      </p>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submitting || myBooks.length === 0 || !selectedBookId}
                        className="w-full md:w-auto"
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
