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
  ShoppingCart,
  Gift,
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

  const getListingIcon = () => {
    switch (book?.listing_type) {
      case "Exchange":
        return <RefreshCw className="h-4 w-4" />
      case "Sell":
        return <DollarSign className="h-4 w-4" />
      case "Donate":
        return <Gift className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb navigation - more compact */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 h-8 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => router.push("/books")}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Books
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
              <p className="text-gray-500 text-sm">Loading book details...</p>
            </div>
          </div>
        ) : book ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {/* Book header section */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Book cover - left column */}
                <div className="md:w-1/3 lg:w-1/4 p-4 md:p-6">
                  {book.cover_image ? (
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border border-gray-200 shadow-sm">
                      <Image
                        src={book.cover_image || "/placeholder.svg"}
                        alt={`Cover for ${book.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[2/3] w-full flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <p className="text-xs text-gray-500 mt-2">No cover available</p>
                    </div>
                  )}
                </div>

                {/* Book details - right column */}
                <div className="flex-1 p-4 md:p-6 md:pt-6 md:pr-6 md:pb-0">
                  {/* Title and badges section */}
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          book.listing_type === "Exchange"
                            ? "default"
                            : book.listing_type === "Sell"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs px-2 py-0.5"
                      >
                        {getListingIcon()} <span className="ml-1">{book.listing_type}</span>
                      </Badge>

                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {book.condition}
                      </Badge>

                      {category && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {category.name}
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">{book.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">By {book.author}</p>

                    {book.listing_type === "Sell" && book.price && (
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                        ${book.price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Listed by section */}
                  <div className="flex items-center mb-4 text-sm">
                    <User className="h-4 w-4 text-gray-500 mr-1.5" />
                    <span className="text-gray-600 dark:text-gray-400 mr-1.5">Listed by</span>
                    <Link
                      href={`/users/${owner?.id}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      {getOwnerName()}
                    </Link>

                    {owner?.location && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600 dark:text-gray-400">{owner.location}</span>
                      </>
                    )}

                    {book.created_at && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {format(new Date(book.created_at), "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description section */}
                  {book.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{book.description}</p>
                    </div>
                  )}

                  {/* ISBN section */}
                  {book.isbn && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
                      <span className="font-medium">ISBN:</span> {book.isbn}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 mt-auto">
                    {user ? (
                      <>
                        {book.user_id !== user.id ? (
                          <>
                            {book.listing_type === "Exchange" && (
                              <Button size="lg" className="flex-1 md:flex-none">
                                <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                              </Button>
                            )}

                            {book.listing_type === "Sell" && (
                              <Button size="lg" className="flex-1 md:flex-none">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
                              </Button>
                            )}

                            {book.listing_type === "Donate" && (
                              <Button size="lg" className="flex-1 md:flex-none">
                                <Gift className="mr-2 h-4 w-4" /> Request Book
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 md:flex-none"
                            onClick={() => router.push(`/dashboard/books/edit/${bookId}`)}
                          >
                            Edit Listing
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

              {/* Additional details section */}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2">
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-medium mb-4">Book Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                      <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Listing Type</p>
                        <p className="text-sm">{book.listing_type}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                      <BookMarked className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Condition</p>
                        <p className="text-sm">{book.condition}</p>
                      </div>
                    </div>

                    {category && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <BookOpen className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Category</p>
                          <p className="text-sm">{category.name}</p>
                        </div>
                      </div>
                    )}

                    {owner?.created_at && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Seller</p>
                          <Link
                            href={`/users/${owner?.id}`}
                            className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            {getOwnerName()}
                          </Link>
                        </div>
                      </div>
                    )}

                    {owner?.location && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Location</p>
                          <p className="text-sm">{owner.location}</p>
                        </div>
                      </div>
                    )}

                    {owner?.created_at && (
                      <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Member since</p>
                          <p className="text-sm">{format(new Date(owner.created_at), "MMMM yyyy")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
