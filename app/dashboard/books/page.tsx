"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardTitle } from "@/components/dashboard/title"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Search, Edit, Eye, BookMarked } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function BooksPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<any[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [booksPerPage, setBooksPerPage] = useState(6)

  // Filter state
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Only fetch books if we have a user
    if (user) {
      fetchBooks()
    }
  }, [user, authLoading, router, currentPage, booksPerPage, filterType, searchQuery])

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true)
      setError(null)
      setIsFiltering(!!searchQuery || filterType !== "all")

      // Calculate range for pagination
      const from = (currentPage - 1) * booksPerPage
      const to = from + booksPerPage - 1

      // Start building the query
      let query = supabase.from("books").select("*").eq("owner_id", user?.id)

      // Apply filters if any
      if (filterType !== "all") {
        query = query.eq("listing_type", filterType)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
      }

      // First, get the total count
      const countQuery = supabase.from("books").select("id", { count: "exact" }).eq("owner_id", user?.id)

      // Apply the same filters to the count query
      if (filterType !== "all") {
        countQuery.eq("listing_type", filterType)
      }

      if (searchQuery) {
        countQuery.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        throw countError
      }

      setTotalBooks(count || 0)

      // Then get paginated data
      const { data, error } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        throw error
      }

      setBooks(data || [])
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoadingBooks(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePerPageChange = (value: string) => {
    setBooksPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleFilterChange = (value: string) => {
    setFilterType(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const clearFilters = () => {
    setFilterType("all")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalBooks / booksPerPage)

  // Only redirect if auth is not loading and there's no user
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to view your books</h1>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Render the page layout even while loading
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book listings" />
        <Button onClick={() => router.push("/dashboard/books/add")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto">
            <label htmlFor="filter-type" className="block text-sm font-medium mb-1">
              Listing Type
            </label>
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger id="filter-type" className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Exchange">Exchange</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
                <SelectItem value="Donate">Donate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSearch} className="flex-1">
            <label htmlFor="search-books" className="block text-sm font-medium mb-1">
              Search Books
            </label>
            <div className="flex gap-2">
              <Input
                id="search-books"
                type="search"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="w-full md:w-auto">
            <label htmlFor="books-per-page" className="block text-sm font-medium mb-1">
              Books per page
            </label>
            <Select value={booksPerPage.toString()} onValueChange={handlePerPageChange}>
              <SelectTrigger id="books-per-page" className="w-full md:w-[100px]">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFiltering && (
            <Button variant="ghost" onClick={clearFilters} className="h-10">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBooks} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {loadingBooks ? (
        // Skeleton loading state that maintains the layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: booksPerPage }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border border-gray-200 hover:border-emerald-200 transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-4">
                  <Skeleton className="h-36 w-24 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="mt-4 flex items-center gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200">
          <BookMarked className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">
            {isFiltering ? "No books match your filters" : "You haven't added any books yet"}
          </h2>
          <p className="text-gray-500 mb-4">
            {isFiltering ? (
              <>
                Try adjusting your search criteria or{" "}
                <button onClick={clearFilters} className="text-emerald-600 hover:underline">
                  clear all filters
                </button>
              </>
            ) : (
              "Add your first book to start exchanging with others"
            )}
          </p>
          {!isFiltering && (
            <Button onClick={() => router.push("/dashboard/books/add")} className="bg-emerald-600 hover:bg-emerald-700">
              Add Your First Book
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="flex flex-col overflow-hidden border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl line-clamp-1" title={book.title}>
                      {book.title}
                    </CardTitle>
                    <Badge
                      variant={
                        book.listing_type === "Exchange"
                          ? "default"
                          : book.listing_type === "Sell"
                            ? "secondary"
                            : "outline"
                      }
                      className="ml-2 flex-shrink-0"
                    >
                      {book.listing_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pb-2">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                      {book.cover_image ? (
                        <div className="relative w-24 h-36 overflow-hidden rounded-md border border-gray-200 shadow-sm">
                          <Image
                            src={book.cover_image || "/placeholder.svg"}
                            alt={`Cover for ${book.title}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 96px"
                          />
                        </div>
                      ) : (
                        <div className="flex w-24 h-36 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 p-2">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                          <p className="text-xs text-gray-500">No cover</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700">By {book.author || "Unknown Author"}</p>
                      {book.description && (
                        <p className="text-gray-600 mt-2 text-sm line-clamp-3" title={book.description}>
                          {book.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-gray-50">
                          {book.condition}
                        </Badge>
                        <Badge
                          variant={
                            book.status === "Available"
                              ? "success"
                              : book.status === "Reserved"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {book.status}
                        </Badge>
                        {book.listing_type === "Sell" && book.price && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            ${book.price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/books/${book.id}`)}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Eye className="mr-1 h-4 w-4" /> View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * booksPerPage + 1, totalBooks)} to{" "}
                {Math.min(currentPage * booksPerPage, totalBooks)} of {totalBooks} books
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                    )
                    .map((page, i, arr) => (
                      <React.Fragment key={page}>
                        {i > 0 && arr[i - 1] !== page - 1 && <span className="text-gray-500">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
