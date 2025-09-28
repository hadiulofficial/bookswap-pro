"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, MessageCircle, BookOpen, MapPin, Clock } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  condition: string
  description: string
  price: number
  listing_type: string
  image_url: string
  category: string
  location: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string
    location: string
  }
}

interface UserBook {
  id: string
  title: string
  author: string
  condition: string
  image_url: string
}

export default function SwapPage() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchBookDetails()
    fetchUser()
  }, [params.id])

  useEffect(() => {
    if (user) {
      fetchUserBooks()
    }
  }, [user])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            location
          )
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error("Error fetching book:", error)
      toast.error("Failed to load book details")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBooks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, condition, image_url")
        .eq("user_id", user.id)
        .eq("listing_type", "swap")
        .neq("id", params.id)

      if (error) throw error
      setUserBooks(data || [])
    } catch (error) {
      console.error("Error fetching user books:", error)
    }
  }

  const handleSwapRequest = async () => {
    if (!user) {
      toast.error("Please log in to request a swap")
      router.push("/login")
      return
    }

    if (!selectedBookId) {
      toast.error("Please select a book to swap")
      return
    }

    if (!message.trim()) {
      toast.error("Please add a message")
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from("swap_requests").insert({
        requester_id: user.id,
        owner_id: book?.user_id,
        requested_book_id: book?.id,
        offered_book_id: selectedBookId,
        message: message.trim(),
        status: "pending",
      })

      if (error) throw error

      toast.success("Swap request sent successfully!")
      router.push("/dashboard/swaps")
    } catch (error) {
      console.error("Error sending swap request:", error)
      toast.error("Failed to send swap request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (book.listing_type !== "swap") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">This book is not available for swap</h1>
          <Link href={`/books/${book.id}`}>
            <Button>View Book Details</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/books/${book.id}`} className="inline-flex items-center text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Book Details
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Book Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Book Swap Request
            </CardTitle>
            <CardDescription>Request to swap books with {book.profiles?.full_name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="relative w-24 h-32 flex-shrink-0">
                <Image
                  src={book.image_url || "/placeholder.svg?height=128&width=96"}
                  alt={book.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{book.title}</h3>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{book.condition}</Badge>
                  <Badge variant="outline">{book.category}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {book.profiles?.location || "Location not specified"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(book.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {book.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 text-sm">{book.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Book Owner</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  {book.profiles?.avatar_url ? (
                    <Image
                      src={book.profiles.avatar_url || "/placeholder.svg"}
                      alt={book.profiles.full_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-emerald-600 font-medium">{book.profiles?.full_name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{book.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500">{book.profiles?.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swap Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Swap Offer</CardTitle>
            <CardDescription>Select one of your books to offer in exchange</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Login Required</h3>
                <p className="text-gray-600 mb-4">You need to be logged in to request a book swap.</p>
                <Link href="/login">
                  <Button>Login to Continue</Button>
                </Link>
              </div>
            ) : userBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Books Available</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any books listed for swap. Add some books to your collection first.
                </p>
                <Link href="/dashboard/books/add">
                  <Button>Add Books</Button>
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="book-select">Select Book to Offer</Label>
                  <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a book from your collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {userBooks.map((userBook) => (
                        <SelectItem key={userBook.id} value={userBook.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-10 relative flex-shrink-0">
                              <Image
                                src={userBook.image_url || "/placeholder.svg?height=40&width=32"}
                                alt={userBook.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{userBook.title}</p>
                              <p className="text-sm text-gray-500">
                                by {userBook.author} • {userBook.condition}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message to Owner</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the owner why you'd like to swap books, or ask any questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSwapRequest}
                  disabled={submitting || !selectedBookId || !message.trim()}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {submitting ? "Sending Request..." : "Send Swap Request"}
                </Button>

                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="space-y-1">
                    <li>• Your swap request will be sent to the book owner</li>
                    <li>• They can accept, decline, or counter your offer</li>
                    <li>• If accepted, you'll coordinate the exchange details</li>
                    <li>• Both parties can leave reviews after the swap</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
