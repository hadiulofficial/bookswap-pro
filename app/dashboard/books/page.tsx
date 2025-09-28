"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardTitle } from "@/components/dashboard/title"
import {
  Loader2,
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

type Book = {
  id: string
  title: string
  author: string
  condition: string
  listing_type: string
  status: string
  price?: number
  cover_image?: string
  created_at: string
}

export default function DashboardBooksPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchBooks()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    filterBooks()
  }, [books, searchQuery, statusFilter, listingTypeFilter])

  useEffect(() => {
    // Update pagination when filtered books change
    const total = Math.ceil(filteredBooks.length / itemsPerPage)
    setTotalPages(total || 1)

    // Reset to page 1 if current page is now invalid
    if (currentPage > total) {
      setCurrentPage(1)
    }
  }, [filteredBooks, itemsPerPage, currentPage])

  const fetchBooks = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching books:", error)
        toast({
          title: "Error",
          description: "Failed to load your books",
          variant: "destructive",
        })
        return
      }

      setBooks(data || [])
    } catch (error) {
      console.error("Exception fetching books:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = books

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((book) => book.status === statusFilter)
    }

    // Listing type filter
    if (listingTypeFilter !== "all") {
      filtered = filtered.filter((book) => book.listing_type === listingTypeFilter)
    }

    setFilteredBooks(filtered)
  }

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId).eq("owner_id", user?.id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Book deleted successfully",
      })

      // Remove from local state
      setBooks((prev) => prev.filter((book) => book.id !== bookId))
    } catch (error: any) {
      console.error("Error deleting book:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "sold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "swapped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getListingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "sale":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "swap":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "donation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  // Get current page books
  const getCurrentPageBooks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBooks.slice(startIndex, endIndex)
  }

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      ))
    }

    const buttons = []

    // First page
    buttons.push(
      <Button key={1} variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(1)}>
        1
      </Button>,
    )

    // Ellipsis or pages around current
    if (currentPage > 3) {
      buttons.push(
        <Button key="ellipsis1" variant="outline" size="sm" disabled>
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Current page area
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(
        <Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i)}>
          {i}
        </Button>,
      )
    }

    // Ellipsis before last page
    if (currentPage < totalPages - 2) {
      buttons.push(
        <Button key="ellipsis2" variant="outline" size="sm" disabled>
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Last page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Button>,
      )
    }

    return buttons
  }

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You must be logged in to view your books</h1>
          <Button onClick={() => router.push("/login")}>Log In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book listings and track their status" />
        <Button asChild>
          <Link href="/dashboard/books/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="swapped">Swapped</SelectItem>
              </SelectContent>
            </Select>

            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="swap">For Swap</SelectItem>
                <SelectItem value="donation">For Donation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-500">Loading your books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {books.length === 0 ? "No books yet" : "No books match your filters"}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {books.length === 0
                ? "Start building your library by adding your first book"
                : "Try adjusting your search or filter criteria"}
            </p>
            {books.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/books/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Book
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getCurrentPageBooks().map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  {book.cover_image ? (
                    <Image
                      src={book.cover_image || "/placeholder.svg"}
                      alt={`Cover for ${book.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
                    <Badge className={getListingTypeColor(book.listing_type)}>
                      {book.listing_type === "swap"
                        ? "Exchange"
                        : book.listing_type === "sale"
                          ? "Sale"
                          : book.listing_type === "donation"
                            ? "Donation"
                            : book.listing_type}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">By {book.author}</p>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{book.condition}</span>
                    {book.listing_type === "sale" && book.price && (
                      <span className="font-medium text-emerald-600">${book.price}</span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/books/${book.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/books/edit/${book.id}`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">{renderPaginationButtons()}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Results summary */}
          <div className="text-center text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of {filteredBooks.length} books
          </div>
        </>
      )}
    </div>
  )
}
