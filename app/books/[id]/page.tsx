"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Loader2,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Heart,
  Calendar,
  Tag,
  BookMarked,
  User,
  MapPin,
  DollarSign,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { addToWishlist, removeFromWishlist } from "@/app/actions/wishlist-actions"

export default function BookDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const { user } = useAuth()

  const [book, setBook] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    fetchBookDetails()
    if (user) {
      checkWishlistStatus()
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

  const checkWishlistStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .single()

      if (!error && data) {
        setInWishlist(true)
      } else {
        setInWishlist(false)
      }
    } catch (err) {
      console.error("Error checking wishlist status:", err)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add books to your wishlist",
        variant: "destructive",
      })
      return
    }

    setWishlistLoading(true)

    try {
      if (inWishlist) {
        const result = await removeFromWishlist(user.id, bookId)
        if (result.success) {
          setInWishlist(false)
          toast({
            title: "Success",
            description: "Book removed from your wishlist",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove from wishlist",
            variant: "destructive",
          })
        }
      } else {
        const result = await addToWishlist(user.id, bookId)
        if (result.success) {
          setInWishlist(true)
          toast({
            title: "Success",
            description: "Book added to your wishlist",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add to wishlist",
            variant: "destructive",
          })
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setWishlistLoading(false)
    }
  }

  const getOwnerName = () => {
    if (owner?.full_name) return owner.full_name
    if (owner?.username) return owner.username
    return "Anonymous User"
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="pl-0" onClick={() => router.push("/books")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-8">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Loading book details...</p>
            </div>
          ) : book ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Book cover */}
                  <div className="flex-shrink-0">
                    {book.cover_image ? (
                      <div className="relative w-full md:w-80 h-96 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={book.cover_image || "/placeholder.svg"}
                          alt={`Cover for ${book.title}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 320px"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="flex w-full md:w-80 h-96 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-4">
                        <BookOpen className="h-16 w-16 text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">No cover available</p>
                      </div>
                    )}
                  </div>

                  {/* Book details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold">{book.title}</h1>
                      <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">By {book.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          book.listing_type === "Exchange"
                            ? "default"
                            : book.listing_type === "Sell"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {book.listing_type}
                      </Badge>

                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {book.condition}
                      </Badge>

                      {book.listing_type === "Sell" && book.price && (
                        <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                          ${book.price.toFixed(2)}
                        </Badge>
                      )}

                      {category && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {category.name}
                        </Badge>
                      )}
                    </div>

                    {book.description && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{book.description}</p>
                      </div>
                    )}

                    {book.isbn && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">ISBN:</span> {book.isbn}
                      </p>
                    )}

                    <div className="pt-4 flex flex-wrap gap-3">
                      {user ? (
                        <>
                          {book.listing_type === "Exchange" && (
                            <Button size="lg" className="flex-1 md:flex-none">
                              <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                            </Button>
                          )}

                          {book.listing_type === "Sell" && (
                            <Button size="lg" className="flex-1 md:flex-none">
                              <DollarSign className="mr-2 h-4 w-4" /> Purchase
                            </Button>
                          )}

                          {book.listing_type === "Donate" && (
                            <Button size="lg" className="flex-1 md:flex-none">
                              Request Book
                            </Button>
                          )}

                          <Button
                            variant={inWishlist ? "outline" : "secondary"}
                            size="lg"
                            className="flex-1 md:flex-none"
                            onClick={handleWishlistToggle}
                            disabled={wishlistLoading}
                          >
                            {wishlistLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                            )}
                            {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                          </Button>
                        </>
                      ) : (
                        <Button asChild size="lg">
                          <Link href="/login">Sign in to interact</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional details */}
                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Book Details</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Listed on</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {book.created_at ? format(new Date(book.created_at), "PPP") : "Unknown"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Listing Type</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{book.listing_type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <BookMarked className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Condition</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{book.condition}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Listed by</p>
                            <Link
                              href={`/users/${owner?.id}`}
                              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              {getOwnerName()}
                            </Link>
                          </div>
                        </div>

                        {owner?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{owner.location}</p>
                            </div>
                          </div>
                        )}

                        {owner?.created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Member since</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(owner.created_at), "MMMM yyyy")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Book not found</h2>
              <p className="text-gray-500 mb-4">The book you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push("/books")}>Browse Books</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
