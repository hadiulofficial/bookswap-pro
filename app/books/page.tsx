"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2, Search, BookOpen, RefreshCw, Filter, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { addToWishlist, removeFromWishlist } from "@/app/actions/wishlist-actions"

export default function PublicBooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [listingType, setListingType] = useState<string | null>(null)
  const [condition, setCondition] = useState<string | null>(null)
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchBooks()
    if (user) {
      fetchWishlistStatus()
    }
  }, [user])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from("books").select("*, profiles(username, full_name)").eq("status", "Available")

      if (listingType) {
        query = query.eq("listing_type", listingType)
      }

      if (condition) {
        query = query.eq("condition", condition)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setBooks(data || [])
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlistStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("wishlists").select("book_id").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching wishlist status:", error)
        return
      }

      const statusMap: Record<string, boolean> = {}
      data.forEach((item) => {
        statusMap[item.book_id] = true
      })

      setWishlistStatus(statusMap)
    } catch (err) {
      console.error("Exception fetching wishlist status:", err)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchBooks()
      return
    }

    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    setBooks(filtered)
  }

  const handleFilterChange = () => {
    fetchBooks()
  }

  const resetFilters = () => {
    setSearchQuery("")
    setListingType(null)
    setCondition(null)
    fetchBooks()
  }

  const getOwnerName = (book: any) => {
    if (book.profiles?.full_name) return book.profiles.full_name
    if (book.profiles?.username) return book.profiles.username
    return "Anonymous User"
  }

  const handleWishlistToggle = async (bookId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add books to your wishlist",
        variant: "destructive",
      })
      return
    }

    setWishlistLoading((prev) => ({ ...prev, [bookId]: true }))

    try {
      const isInWishlist = wishlistStatus[bookId]

      if (isInWishlist) {
        const result = await removeFromWishlist(user.id, bookId)
        if (result.success) {
          setWishlistStatus((prev) => ({ ...prev, [bookId]: false }))
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
          setWishlistStatus((prev) => ({ ...prev, [bookId]: true }))
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
      setWishlistLoading((prev) => ({ ...prev, [bookId]: false }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-3 max-w-[800px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse Available Books</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Discover books available for exchange, purchase, or donation
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    placeholder="Search by title, author, or description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <Select value={listingType || ""} onValueChange={(value) => setListingType(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Listing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Exchange">Exchange</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                    <SelectItem value="Donate">Donate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={condition || ""} onValueChange={(value) => setCondition(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Condition</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Acceptable">Acceptable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={handleFilterChange}>
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </div>

          {/* Login CTA for non-authenticated users */}
          {!user && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                    Want to swap, sell, or get books?
                  </h2>
                  <p className="text-emerald-700 dark:text-emerald-400">
                    Sign in to contact book owners and list your own books.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-8">
              <p>{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Loading books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No books found</h2>
              <p className="text-gray-500 mb-4">Try adjusting your filters or check back later</p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    {book.cover_image ? (
                      <Image
                        src={book.cover_image || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 right-2"
                      variant={
                        book.listing_type === "Exchange"
                          ? "default"
                          : book.listing_type === "Sell"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {book.listing_type}
                    </Badge>
                    {user && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 left-2 h-8 w-8 rounded-full ${
                          wishlistStatus[book.id] ? "text-red-500 bg-white/80" : "text-gray-500 bg-white/80"
                        } hover:text-red-500 hover:bg-white`}
                        onClick={() => handleWishlistToggle(book.id)}
                        disabled={wishlistLoading[book.id]}
                      >
                        {wishlistLoading[book.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart
                            className={`h-4 w-4 ${wishlistStatus[book.id] ? "fill-current" : ""}`}
                            aria-label={wishlistStatus[book.id] ? "Remove from wishlist" : "Add to wishlist"}
                          />
                        )}
                      </Button>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                    <p className="text-sm text-gray-500">By {book.author}</p>
                  </CardHeader>
                  <CardContent>
                    {book.description && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{book.condition}</Badge>
                      {book.listing_type === "Sell" && book.price && (
                        <Badge variant="secondary">${book.price.toFixed(2)}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Listed by {getOwnerName(book)}</p>
                  </CardContent>
                  <CardFooter>
                    {user ? (
                      <Button className="w-full">
                        {book.listing_type === "Exchange" ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
                          </>
                        ) : book.listing_type === "Sell" ? (
                          "Purchase"
                        ) : (
                          "Request Book"
                        )}
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Sign in to interact</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
