"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardTitle } from "@/components/dashboard/title"
import { supabase } from "@/lib/supabase/client"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Gift,
  BarChart3,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  description: string | null
  condition: string
  listing_type: string
  price: number | null
  status: string
  image_url: string | null
  category_id: number | null
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
}

export default function BooksPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedListingType, setSelectedListingType] = useState<string>("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchBooks()
      fetchCategories()
    }
  }, [user, authLoading, router])

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("books")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setBooks(data || [])
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to fetch books")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase.from("categories").select("id, name").order("name")

      if (fetchError) {
        throw fetchError
      }

      setCategories(data || [])
    } catch (err: any) {
      console.error("Error fetching categories:", err)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return
    }

    try {
      const { error: deleteError } = await supabase.from("books").delete().eq("id", bookId).eq("owner_id", user?.id)

      if (deleteError) {
        throw deleteError
      }

      setBooks(books.filter((book) => book.id !== bookId))
    } catch (err: any) {
      console.error("Error deleting book:", err)
      alert("Failed to delete book: " + err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "donated":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "swapped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getListingTypeIcon = (listingType: string) => {
    switch (listingType.toLowerCase()) {
      case "sell":
        return <DollarSign className="h-4 w-4" />
      case "donate":
        return <Gift className="h-4 w-4" />
      case "swap":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getListingTypeColor = (listingType: string) => {
    switch (listingType.toLowerCase()) {
      case "sell":
        return "bg-green-100 text-green-800 border-green-200"
      case "donate":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "swap":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized"
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "Unknown"
  }

  // Filter books based on search and filters
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || book.category_id?.toString() === selectedCategory
    const matchesStatus = selectedStatus === "all" || book.status.toLowerCase() === selectedStatus.toLowerCase()
    const matchesListingType =
      selectedListingType === "all" || book.listing_type.toLowerCase() === selectedListingType.toLowerCase()

    return matchesSearch && matchesCategory && matchesStatus && matchesListingType
  })

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DashboardTitle title="My Books" description="Manage your book collection and listings" />
        <Button onClick={() => router.push("/dashboard/books/add")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Book
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="donated">Donated</SelectItem>
                <SelectItem value="swapped">Swapped</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedListingType} onValueChange={setSelectedListingType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sell">For Sale</SelectItem>
                <SelectItem value="donate">Donate</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedStatus("all")
                setSelectedListingType("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={fetchBooks} className="ml-2 bg-transparent">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!isLoading && !error && (
        <>
          {filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {books.length === 0 ? "No books yet" : "No books match your filters"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {books.length === 0
                    ? "Start building your library by adding your first book to BookSwap."
                    : "Try adjusting your search terms or filters to find what you're looking for."}
                </p>
                {books.length === 0 ? (
                  <Button onClick={() => router.push("/dashboard/books/add")} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Book
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                      setSelectedListingType("all")
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative bg-gray-100">
                    {book.image_url ? (
                      <img
                        src={book.image_url || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/books/${book.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Book
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Book
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
                        <Badge variant="outline" className={getListingTypeColor(book.listing_type)}>
                          <span className="flex items-center gap-1">
                            {getListingTypeIcon(book.listing_type)}
                            {book.listing_type}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Category: {getCategoryName(book.category_id)}</p>
                        <p>Condition: {book.condition}</p>
                        {book.price && <p className="font-medium text-green-600">${book.price}</p>}
                      </div>

                      {book.description && <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/books/${book.id}`)}
                          className="flex-1"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}
                          className="flex-1"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      {!isLoading && !error && books.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Collection Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{books.length}</div>
                <div className="text-sm text-gray-600">Total Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {books.filter((book) => book.status === "available").length}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {books.filter((book) => book.listing_type === "sell").length}
                </div>
                <div className="text-sm text-gray-600">For Sale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {books.filter((book) => book.listing_type === "swap").length}
                </div>
                <div className="text-sm text-gray-600">For Swap</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
