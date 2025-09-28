"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Search, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

interface Book {
  id: string
  title: string
  author: string
  category: string
  listing_type: "sale" | "swap" | "donation"
  price?: number
  condition: string
  image_url?: string
  created_at: string
  profiles?: {
    full_name: string
    avatar_url?: string
  }
}

interface BooksPageClientProps {
  books: Book[]
  totalPages: number
  currentPage: number
  categories: string[]
  initialSearch: string
  initialCategory: string
  initialListingType: string
}

export function BooksPageClient({
  books,
  totalPages,
  currentPage,
  categories,
  initialSearch,
  initialCategory,
  initialListingType,
}: BooksPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [listingType, setListingType] = useState(initialListingType)
  const supabase = createClientComponentClient()

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }

    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }

    if (listingType) {
      params.set("listing_type", listingType)
    } else {
      params.delete("listing_type")
    }

    params.delete("page") // Reset to first page when filtering

    startTransition(() => {
      router.push(`/dashboard/books?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setListingType("")
    startTransition(() => {
      router.push("/dashboard/books")
    })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())

    startTransition(() => {
      router.push(`/dashboard/books?${params.toString()}`)
    })
  }

  const handleDelete = async (bookId: string) => {
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

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case "sale":
        return "bg-green-100 text-green-800"
      case "swap":
        return "bg-blue-100 text-blue-800"
      case "donation":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Link href="/dashboard/books/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && updateFilters()}
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger>
                <SelectValue placeholder="Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="swap">For Swap</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={updateFilters} disabled={isPending}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500 mb-4">No books found</p>
            <Link href="/dashboard/books/new">
              <Button>Add Your First Book</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image
                  src={book.image_url || "/placeholder.svg?height=300&width=200"}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getListingTypeColor(book.listing_type)}>{book.listing_type}</Badge>
                  {book.listing_type === "sale" && book.price && (
                    <span className="font-semibold text-green-600">${book.price}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">Condition: {book.condition}</p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/books/edit/${book.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(book.id)}
                    className="text-red-600 hover:text-red-700"
                  >
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
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={isPending}
              >
                {page}
              </Button>
            ))}
          </div>

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
