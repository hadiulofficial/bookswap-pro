"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Loader2,
  Search,
  BookOpen,
  Filter,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRightIcon,
  MoreHorizontal,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { addToWishlist, removeFromWishlist } from "@/app/actions/wishlist-actions"

export default function PublicBooksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [allBooks, setAllBooks] = useState<any[]>([]) // All fetched books
  const [books, setBooks] = useState<any[]>([]) // Books for current page
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [listingType, setListingType] = useState<string | null>(null)
  const [condition, setCondition] = useState<string | null>(null)
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9) // 9 items per page (3x3 grid on desktop)
  const [totalPages, setTotalPages] = useState(1)

  // Function to scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Calculate pagination based on all books
  const updatePagination = useCallback(
    (booksArray: any[]) => {
      const total = Math.ceil(booksArray.length / itemsPerPage)
      setTotalPages(total || 1) // Ensure at least 1 page even if no books

      // Reset to page 1 if current page is now invalid
      if (currentPage > total) {
        setCurrentPage(1)
      }

      // Slice the books array for the current page
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setBooks(booksArray.slice(startIndex, endIndex))
    },
    [currentPage, itemsPerPage],
  )

  // Fetch books from API with timeout
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Set a timeout for the request
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000), // 10 second timeout
      )

      let query = supabase
        .from("books")
        .select("*, profiles(id, username, full_name), owner_id")
        .eq("status", "Available")

      // If user is logged in, exclude their own books
      if (user) {
        query = query.neq("owner_id", user.id)
      }

      if (listingType) {
        query = query.eq("listing_type", listingType)
      }

      if (condition) {
        query = query.eq("condition", condition)
      }

      const queryPromise = query.order("created_at", { ascending: false })

      // Race between the query and timeout
      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        throw error
      }

      setAllBooks(data || [])
      updatePagination(data || [])
    } catch (err: any) {
      console.error("Error fetching books:", err)
      if (err.message === "Request timeout") {
        setError("Connection timeout. Please check your internet connection and try again.")
      } else {
        setError(err.message || "Failed to load books")
      }
      setAllBooks([])
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [user, listingType, condition, updatePagination])

  // Initial fetch
  useEffect(() => {
    fetchBooks()
    if (user) {
      fetchWishlistStatus()
    }
  }, [user, fetchBooks])

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
      // Reset to all books if search is cleared
      updatePagination(allBooks)
      return
    }

    const filtered = allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Update pagination with filtered results
    updatePagination(filtered)
    // Reset to first page when searching
    setCurrentPage(1)
  }

  const handleFilterChange = () => {
    fetchBooks()
    setIsFilterOpen(false) // Close mobile filter drawer after applying
    setCurrentPage(1) // Reset to first page when filters change
  }

  const resetFilters = () => {
    setSearchQuery("")
    setListingType(null)
    setCondition(null)
    fetchBooks()
    setIsFilterOpen(false) // Close mobile filter drawer after resetting
    setCurrentPage(1) // Reset to first page when filters reset
  }

  const getOwnerName = (book: any) => {
    if (book.profiles?.full_name) return book.profiles.full_name
    if (book.profiles?.username) return book.profiles.username
    return "Anonymous User"
  }

  const handleWishlistToggle = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation() // Prevent card click when clicking the wishlist button

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

  const navigateToBookDetails = (bookId: string) => {
    router.push(`/books/${bookId}`)
  }

  // Handle page change
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    scrollToTop()

    // Update displayed books for the new page
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setBooks(allBooks.slice(startIndex, endIndex))
  }

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    // For small number of pages, show all
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          className={`h-9 w-9 ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          onClick={() => changePage(page)}
        >
          {page}
        </Button>
      ))
    }

    // For larger number of pages, show current, prev, next, first, last and ellipsis
    const buttons = []

    // First page
    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        className={`h-9 w-9 ${currentPage === 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
        onClick={() => changePage(1)}
      >
        1
      </Button>,
    )

    // Ellipsis or second page
    if (currentPage > 3) {
      buttons.push(
        <Button key="ellipsis1" variant="outline" size="icon" className="h-9 w-9 bg-transparent" disabled>
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    } else if (totalPages > 1) {
      buttons.push(
        <Button
          key={2}
          variant={currentPage === 2 ? "default" : "outline"}
          size="icon"
          className={`h-9 w-9 ${currentPage === 2 ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          onClick={() => changePage(2)}
        >
          2
        </Button>,
      )
    }

    // Current page (if not first or last)
    if (currentPage !== 1 && currentPage !== totalPages) {
      buttons.push(
        <Button
          key={currentPage}
          variant="default"
          size="icon"
          className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => changePage(currentPage)}
        >
          {currentPage}
        </Button>,
      )
    }

    // Ellipsis or second-to-last page
    if (currentPage < totalPages - 2) {
      buttons.push(
        <Button key="ellipsis2" variant="outline" size="icon" className="h-9 w-9 bg-transparent" disabled>
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    } else if (totalPages > 2) {
      buttons.push(
        <Button
          key={totalPages - 1}
          variant={currentPage === totalPages - 1 ? "default" : "outline"}
          size="icon"
          className={`h-9 w-9 ${currentPage === totalPages - 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          onClick={() => changePage(totalPages - 1)}
        >
          {totalPages - 1}
        </Button>,
      )
    }

    // Last page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          className={`h-9 w-9 ${currentPage === totalPages ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          onClick={() => changePage(totalPages)}
        >
          {totalPages}
        </Button>,
      )
    }

    return buttons
  }

  // Filter component that will be used in both sidebar and mobile drawer
  const FiltersComponent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Search</h3>
        <div className="relative">
          <Input
            placeholder="Title, author, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Listing Type</h3>
        <Select value={listingType || "all"} onValueChange={(value) => setListingType(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
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
        <h3 className="text-lg font-medium mb-3">Condition</h3>
        <Select value={condition || "all"} onValueChange={(value) => setCondition(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Like New">Like New</SelectItem>
            <SelectItem value="Very Good">Very Good</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Acceptable">Acceptable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button onClick={handleFilterChange}>
          <Filter className="mr-2 h-4 w-4" /> Apply Filters
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2 max-w-[800px]">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse Available Books</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Discover books available for exchange, purchase, or donation
              </p>
            </div>
          </div>

          {/* Mobile Filter Button - Only visible on small screens */}
          <div className="md:hidden mb-6">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FiltersComponent />
              </SheetContent>
            </Sheet>
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

          {/* User's books management link */}
          {user && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                    Looking for your listings?
                  </h2>
                  <p className="text-emerald-700 dark:text-emerald-400">Manage your books in the dashboard.</p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/books">Manage My Books</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Main content area with sidebar layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FiltersComponent />
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1">
              {/* Error message with better UI */}
              {error && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Unable to Load Books</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={fetchBooks} className="flex items-center">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state with timeout indicator */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-200 dark:border-emerald-800"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Loading Books...</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                    We're fetching the latest available books for you. This should only take a moment.
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    If this takes too long, please check your internet connection
                  </div>
                </div>
              ) : !error && allBooks.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No Books Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {searchQuery || listingType || condition
                      ? "No books match your current filters. Try adjusting your search criteria."
                      : "There are currently no books available. Be the first to list a book!"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchQuery || listingType || condition ? (
                      <Button onClick={resetFilters} variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    ) : null}
                    {user ? (
                      <Button asChild>
                        <Link href="/dashboard/books/new">
                          <BookOpen className="mr-2 h-4 w-4" />
                          List Your First Book
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/signup">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Join BookSwap
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="mb-4 text-sm text-gray-500">
                    Showing {books.length} of {allBooks.length} books
                  </div>

                  {/* Books grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <Card
                        key={book.id}
                        className="overflow-hidden group transition-all duration-200 hover:shadow-md cursor-pointer"
                        onClick={() => navigateToBookDetails(book.id)}
                      >
                        <div
                          className={`relative h-48 bg-gray-100 dark:bg-gray-700 ${book.status === "reserved" && book.listing_type === "Donate" ? "opacity-75 grayscale-[30%]" : ""}`}
                        >
                          {book.cover_image ? (
                            <Image
                              src={book.cover_image || "/placeholder.svg"}
                              alt={book.title}
                              fill
                              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${book.status === "reserved" && book.listing_type === "Donate" ? "opacity-75" : ""}`}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <Badge
                            className="absolute top-2 right-2 z-10"
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

                          {/* Donated badge */}
                          {book.status === "reserved" && book.listing_type === "Donate" && (
                            <Badge className="absolute top-2 left-2 z-10 bg-green-500 hover:bg-green-600">
                              <Check className="h-3 w-3 mr-1" /> Donated
                            </Badge>
                          )}

                          {user && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`absolute top-2 left-2 z-10 h-8 w-8 rounded-full ${
                                wishlistStatus[book.id] ? "text-red-500 bg-white/80" : "text-gray-500 bg-white/80"
                              } hover:text-red-500 hover:bg-white`}
                              onClick={(e) => handleWishlistToggle(e, book.id)}
                              disabled={
                                wishlistLoading[book.id] ||
                                (book.status === "reserved" && book.listing_type === "Donate")
                              }
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
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {book.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500">By {book.author}</p>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {book.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{book.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{book.condition}</Badge>
                            {book.listing_type === "Sell" && book.price && (
                              <Badge variant="secondary" className="font-medium">
                                ${book.price.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            Listed by{" "}
                            {book.profiles?.id ? (
                              <Link
                                href={`/users/${book.profiles.id}`}
                                className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking the username
                              >
                                {getOwnerName(book)}
                              </Link>
                            ) : (
                              getOwnerName(book)
                            )}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          {book.status === "reserved" && book.listing_type === "Donate" ? (
                            <Button variant="outline" className="w-full justify-between bg-transparent" disabled>
                              Already Donated <Check className="h-4 w-4 ml-2 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              className="w-full justify-between group-hover:bg-emerald-50 group-hover:text-emerald-600"
                            >
                              View Details <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => changePage(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="hidden sm:flex items-center space-x-2">{renderPaginationButtons()}</div>

                        {/* Mobile pagination indicator */}
                        <div className="sm:hidden flex items-center">
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => changePage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
