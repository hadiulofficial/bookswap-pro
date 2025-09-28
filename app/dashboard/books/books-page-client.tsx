"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number | null
  condition: string
  status: string
  listing_type: string
  image_url: string | null
  created_at: string
  categories: { name: string } | null
}

interface Category {
  id: string
  name: string
}

interface BooksPageClientProps {
  initialBooks: Book[]
  categories: Category[]
  totalPages: number
  currentPage: number
  initialSearch: string
  initialCategory: string
  initialStatus: string
}

export function BooksPageClient({
  initialBooks,
  categories,
  totalPages,
  currentPage,
  initialSearch,
  initialCategory,
  initialStatus,
}: BooksPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [status, setStatus] = useState(initialStatus)
  const supabase = createClientComponentClient()

  const updateURL = (newSearch: string, newCategory: string, newStatus: string, page = 1) => {
    const params = new URLSearchParams()
    if (newSearch) params.set("search", newSearch)
    if (newCategory) params.set("category", newCategory)
    if (newStatus) params.set("status", newStatus)
    if (page > 1) params.set("page", page.toString())

    const url = params.toString() ? `/dashboard/books?${params.toString()}` : "/dashboard/books"
    router.push(url)
  }

  const handleSearch = () => {
    startTransition(() => {
      updateURL(search, category, status)
    })
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    startTransition(() => {
      updateURL(search, newCategory, status)
    })
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    startTransition(() => {
      updateURL(search, category, newStatus)
    })
  }

  const handlePageChange = (page: number) => {
    startTransition(() => {
      updateURL(search, category, status, page)
    })
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Book deleted successfully",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "sold":
        return "bg-gray-100 text-gray-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case "sale":
        return "bg-blue-100 text-blue-800"
      case "swap":
        return "bg-purple-100 text-purple-800"
      case "donation":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, author, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} disabled={isPending}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {initialBooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search || category || status
                ? "Try adjusting your filters to see more results."
                : "You haven't added any books yet. Start building your collection!"}
            </p>
            <Link href="/dashboard/books/add">
              <Button>Add Your First Book</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                {book.image_url ? (
                  <Image src={book.image_url || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                    <CardDescription className="line-clamp-1">by {book.author}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
                    <Badge className={getListingTypeColor(book.listing_type)}>{book.listing_type}</Badge>
                  </div>

                  {book.categories && <p className="text-xs text-muted-foreground">{book.categories.name}</p>}

                  {book.price && book.listing_type === "sale" && (
                    <p className="text-lg font-semibold text-green-600">${book.price}</p>
                  )}

                  <p className="text-xs text-muted-foreground capitalize">Condition: {book.condition}</p>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/books/edit/${book.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isPending}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  )
}
