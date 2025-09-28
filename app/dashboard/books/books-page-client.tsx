"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number | null
  category: string
  listing_type: "sale" | "swap" | "donation"
  condition: string | null
  image_url: string | null
  created_at: string
}

interface BooksPageClientProps {
  initialBooks: Book[]
  totalPages: number
  currentPage: number
  initialSearch: string
  initialCategory: string
  initialListingType: string
}

export function BooksPageClient({
  initialBooks,
  totalPages,
  currentPage,
  initialSearch,
  initialCategory,
  initialListingType,
}: BooksPageClientProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [listingType, setListingType] = useState(initialListingType)
  const [isPending, startTransition] = useTransition()

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      if (search) {
        params.set("search", search)
      } else {
        params.delete("search")
      }

      if (category !== "all") {
        params.set("category", category)
      } else {
        params.delete("category")
      }

      if (listingType !== "all") {
        params.set("listing_type", listingType)
      } else {
        params.delete("listing_type")
      }

      params.delete("page") // Reset to first page when searching

      router.push(`/dashboard/books?${params.toString()}`)
    })
  }

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.set("page", page.toString())
      router.push(`/dashboard/books?${params.toString()}`)
    })
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("books").delete().eq("id", bookId)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== bookId))
      toast({
        title: "Success",
        description: "Book deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  const getListingTypeBadge = (type: string) => {
    switch (type) {
      case "sale":
        return <Badge variant="default">For Sale</Badge>
      case "swap":
        return <Badge variant="secondary">For Swap</Badge>
      case "donation":
        return <Badge variant="outline">Donation</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-gray-600">Manage your book listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-fiction</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                <SelectItem value="biography">Biography</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="self-help">Self-Help</SelectItem>
              </SelectContent>
            </Select>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="swap">For Swap</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isPending}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">
              {search || category !== "all" || listingType !== "all"
                ? "Try adjusting your search filters"
                : "You haven't added any books yet. Start by adding your first book!"}
            </p>
            <Button asChild>
              <Link href="/dashboard/books/add">Add Your First Book</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="relative h-48">
                {book.image_url ? (
                  <Image src={book.image_url || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                  {getListingTypeBadge(book.listing_type)}
                </div>
                <p className="text-sm text-gray-600">by {book.author}</p>
              </CardHeader>
              <CardContent>
                {book.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Category: {book.category}</span>
                  {book.price && <span className="font-semibold text-green-600">${book.price}</span>}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/books/${book.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/books/edit/${book.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(book.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
          >
            Previous
          </Button>

          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = Math.max(1, currentPage - 2) + i
            if (page > totalPages) return null

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                disabled={isPending}
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
