"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2, BookOpen, ArrowLeft, RefreshCw, User, Check, Users, MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function BookSwapPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const { user } = useAuth()

  const [book, setBook] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [userBooks, setUserBooks] = useState<any[]>([])
  const [selectedBook, setSelectedBook] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookDetails()
    if (user) {
      fetchUserBooks()
    }
  }, [bookId, user])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*, profiles(id, username, full_name, location, created_at)")
        .eq("id", bookId)
        .single()

      if (bookError) {
        throw bookError
      }

      if (!bookData) {
        throw new Error("Book not found")
      }

      setBook(bookData)
      setOwner(bookData.profiles)

      // If book has a category, fetch category details
      if (bookData.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", bookData.category_id)
          .single()

        if (!categoryError && categoryData) {
          setCategory(categoryData)
        }
      }
    } catch (err: any) {
      console.error("Error fetching book details:", err)
      setError(err.message || "Failed to load book details")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBooks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "available")
        .neq("id", bookId) // Exclude the current book

      if (error) {
        console.error("Error fetching user books:", error)
        return
      }

      setUserBooks(data || [])
    } catch (err) {
      console.error("Error fetching user books:", err)
    }
  }

  const handleSwapRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request a swap",
        variant: "destructive",
      })
      return
    }

    if (!selectedBook) {
      toast({
        title: "Book selection required",
        description: "Please select a book to offer for the swap",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Create swap request
      const { data, error } = await supabase
        .from("swap_requests")
        .insert({
          requester_id: user.id,
          owner_id: book.owner_id,
          requested_book_id: bookId,
          offered_book_id: selectedBook,
          status: "pending",
          message: `Swap request for "${book.title}"`,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Swap Request Sent!",
        description: "The book owner has been notified of your swap request.",
      })

      // Redirect to swaps page
      router.push("/dashboard/swaps")
    } catch (error: any) {
      console.error("Error creating swap request:", error)
      toast({
        title: "Request Failed",
        description: error.message || "An error occurred while sending your swap request.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getOwnerName = () => {
    if (owner?.full_name) return owner.full_name
    if (owner?.username) return owner.username
    return "Anonymous User"
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to request a book swap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/signup">Create Account</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 h-8 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => router.push(`/books/${bookId}`)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Book Details
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-gray-500 text-sm">Loading swap details...</p>
            </div>
          </div>
        ) : book ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Book being requested */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Book You Want
                  </CardTitle>
                  <CardDescription>This is the book you're requesting to swap</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="w-24 h-32 flex-shrink-0">
                      {book.cover_image ? (
                        <Image
                          src={book.cover_image || "/placeholder.svg"}
                          alt={`Cover for ${book.title}`}
                          width={96}
                          height={128}
                          className="w-full h-full object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md border">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">By {book.author}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {book.condition}
                        </Badge>
                        {category && (
                          <Badge variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>Owned by {getOwnerName()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User's books to offer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-emerald-600" />
                    Your Books to Offer
                  </CardTitle>
                  <CardDescription>Select a book from your collection to offer in exchange</CardDescription>
                </CardHeader>
                <CardContent>
                  {userBooks.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">No Books Available</h3>
                      <p className="text-gray-500 mb-4">You need to have books in your collection to request a swap.</p>
                      <Button asChild>
                        <Link href="/dashboard/books/add">Add a Book</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userBooks.map((userBook) => (
                        <div
                          key={userBook.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedBook === userBook.id
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedBook(userBook.id)}
                        >
                          <div className="flex gap-3">
                            <div className="w-16 h-20 flex-shrink-0">
                              {userBook.cover_image ? (
                                <Image
                                  src={userBook.cover_image || "/placeholder.svg"}
                                  alt={`Cover for ${userBook.title}`}
                                  width={64}
                                  height={80}
                                  className="w-full h-full object-cover rounded border"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded border">
                                  <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{userBook.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">By {userBook.author}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {userBook.condition}
                                </Badge>
                              </div>
                            </div>
                            {selectedBook === userBook.id && (
                              <div className="flex items-center">
                                <Check className="h-5 w-5 text-emerald-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Swap request section */}
            {userBooks.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Complete Your Swap Request
                  </CardTitle>
                  <CardDescription>Review your swap request and send it to the book owner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedBook && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Swap Summary:</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>
                          You're offering:{" "}
                          <span className="font-medium">{userBooks.find((b) => b.id === selectedBook)?.title}</span>
                        </p>
                        <p>
                          In exchange for: <span className="font-medium">{book.title}</span>
                        </p>
                        <p>
                          Book owner: <span className="font-medium">{getOwnerName()}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={handleSwapRequest}
                      disabled={!selectedBook || submitting}
                      className="flex-1"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Send Swap Request
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/books/${bookId}`)} size="lg">
                      Cancel
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>
                      By sending this request, you agree to our{" "}
                      <Link href="/terms" className="text-emerald-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-emerald-600 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h2 className="text-xl font-medium mb-2">Book not found</h2>
              <p className="text-gray-500 mb-4">The book you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push("/books")}>Browse Books</Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
