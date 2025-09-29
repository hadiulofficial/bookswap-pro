"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BookPlus, Search, Edit, Trash2, Eye, AlertCircle, BookOpen, RefreshCw, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  description: string
  condition: string
  listing_type: string
  status: string
  price: number | null
  cover_image: string | null
  created_at: string
  category: {
    name: string
  } | null
}

export default function BooksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [listingTypeFilter, setListingTypeFilter] = useState("all")
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchBooks = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from("books")
        .select(`
          id,
          title,
          author,
          description,
          condition,
          listing_type,
          status,
          price,
          cover_image,
          created_at,
          category:categories(name)
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }
      if (listingTypeFilter !== "all") {
        query = query.eq("listing_type", listingTypeFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Filter by search term on client side
      let filteredBooks = data || []
      if (searchTerm) {
        filteredBooks = filteredBooks.filter(
          (book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setBooks(filteredBooks)
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    try {
      setDeleting(bookId)
      const { error } = await supabase.from("books").delete().eq("id", bookId)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== bookId))
    } catch (err: any) {
      console.error("Error deleting book:", err)
      alert("Failed to delete book: " + err.message)
    } finally {
      setDeleting(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setListingTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || listingTypeFilter !== "all"

  useEffect(() => {
    fetchBooks()
  }, [user?.id, statusFilter, listingTypeFilter])

  // Filter books based on search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DashboardTitle title="My Books" description="Manage your book collection" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-20 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book collection" />
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/dashboard/books/add">
            <BookPlus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Exchange">Exchange</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
                <SelectItem value="Donate">Donate</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap bg-transparent">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchBooks} className="ml-4 bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 && !loading && !error ? (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {hasActiveFilters ? "No books match your filters" : "No books yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your search terms or filters to find more books."
                : "Start building your book collection by adding your first book."}
            </p>
            <div className="flex gap-3">
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : null}
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard/books/add">
                  <BookPlus className="mr-2 h-4 w-4" />
                  Add Your First Book
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Book Cover */}
                  <div className="w-24 h-32 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                    {book.cover_image ? (
                      <Image
                        src={book.cover_image || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{book.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">by {book.author}</p>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant={book.status === "Available" ? "default" : "secondary"} className="text-xs">
                          {book.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {book.listing_type}
                        </Badge>
                        {book.listing_type === "Sell" && book.price && (
                          <Badge variant="outline" className="text-xs">
                            ${book.price}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 pt-2">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                          <Link href={`/dashboard/books/${book.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                          <Link href={`/dashboard/books/edit/${book.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                          disabled={deleting === book.id}
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === book.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
