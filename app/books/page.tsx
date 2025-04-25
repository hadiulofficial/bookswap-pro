"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2, Search, BookOpen, Filter, BookmarkPlus, Headphones, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define book type
type Book = {
  id: string
  title: string
  author: string
  description: string | null
  condition: string
  cover_image: string | null
  listing_type: string
  price: number | null
  category_id: number
  category_name?: string
  owner_id: string
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

export default function PublicBooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [listingType, setListingType] = useState<string>("all")
  const [condition, setCondition] = useState<string>("any")
  const [sortBy, setSortBy] = useState<string>("latest")
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeView, setActiveView] = useState("grid")

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [books, searchQuery, listingType, condition, selectedCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(`
          *,
          profiles(username, full_name),
          categories(name)
        `)
        .eq("status", "Available")
        .order("created_at", { ascending: false })

      if (booksError) throw booksError

      // Transform the data to include category_name
      const transformedBooks =
        booksData?.map((book) => ({
          ...book,
          category_name: book.categories?.name || "Uncategorized",
        })) || []

      setBooks(transformedBooks)
      setFilteredBooks(transformedBooks)
    } catch (err: any) {
      console.error("Error fetching books:", err)
      setError(err.message || "Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...books]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply listing type filter
    if (listingType !== "all") {
      result = result.filter((book) => book.listing_type === listingType)
    }

    // Apply condition filter
    if (condition !== "any") {
      result = result.filter((book) => book.condition === condition)
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((book) => book.category_name === selectedCategory)
    }

    // Apply sorting
    if (sortBy === "latest") {
      // Already sorted by created_at desc from the query
    } else if (sortBy === "oldest") {
      result = [...result].reverse()
    } else if (sortBy === "title_asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "title_desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title))
    } else if (sortBy === "author_asc") {
      result = [...result].sort((a, b) => a.author.localeCompare(b.author))
    } else if (sortBy === "author_desc") {
      result = [...result].sort((a, b) => b.author.localeCompare(a.author))
    }

    setFilteredBooks(result)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setListingType("all")
    setCondition("any")
    setSelectedCategory("all")
    setSortBy("latest")
  }

  const getOwnerName = (book: Book) => {
    if (book.profiles?.full_name) return book.profiles.full_name
    if (book.profiles?.username) return book.profiles.username
    return "Anonymous User"
  }

  const getListingTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Exchange":
        return "default"
      case "Sell":
        return "secondary"
      case "Donate":
        return "success"
      default:
        return "outline"
    }
  }

  const getCategoryColor = (category: string) => {
    // Map categories to colors for visual distinction
    const colorMap: Record<string, string> = {
      Fiction: "bg-blue-50 text-blue-700",
      "Non-Fiction": "bg-green-50 text-green-700",
      "Science Fiction": "bg-purple-50 text-purple-700",
      Mystery: "bg-yellow-50 text-yellow-700",
      Biography: "bg-pink-50 text-pink-700",
      History: "bg-amber-50 text-amber-700",
      "Self-Help": "bg-emerald-50 text-emerald-700",
      Business: "bg-indigo-50 text-indigo-700",
      Romance: "bg-rose-50 text-rose-700",
      Thriller: "bg-red-50 text-red-700",
      Fantasy: "bg-violet-50 text-violet-700",
      Science: "bg-cyan-50 text-cyan-700",
      Technology: "bg-sky-50 text-sky-700",
      Art: "bg-fuchsia-50 text-fuchsia-700",
      Cooking: "bg-lime-50 text-lime-700",
      Travel: "bg-orange-50 text-orange-700",
      Poetry: "bg-teal-50 text-teal-700",
      Philosophy: "bg-slate-50 text-slate-700",
    }

    return colorMap[category] || "bg-gray-50 text-gray-700"
  }

  // Render book grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="overflow-hidden group hover:shadow-md transition-shadow duration-200">
            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700">
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

              {/* Audio indicator */}
              {Math.random() > 0.7 && (
                <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-sm">
                  <Headphones className="h-4 w-4 text-emerald-600" />
                </div>
              )}

              {/* Bookmark button */}
              <button className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800">
                <BookmarkPlus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Listing type badge */}
              <Badge className="absolute bottom-2 right-2" variant={getListingTypeBadgeVariant(book.listing_type)}>
                {book.listing_type}
                {book.listing_type === "Sell" && book.price && ` • $${book.price.toFixed(2)}`}
              </Badge>
            </div>

            <div className="p-4">
              {/* Category */}
              <div
                className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium mb-2 ${getCategoryColor(
                  book.category_name || "",
                )}`}
              >
                {book.category_name || "Uncategorized"}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg mb-1 line-clamp-1">{book.title}</h3>

              {/* Author */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">By {book.author}</p>

              {/* Condition */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {book.condition}
                </Badge>

                {user ? (
                  <Button size="sm" variant="ghost" className="text-xs">
                    View Details
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" asChild className="text-xs">
                    <Link href="/login">Sign in to view</Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Render book list view
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative w-24 sm:w-32 md:w-40 bg-gray-100 dark:bg-gray-700">
              {book.cover_image ? (
                <Image
                  src={book.cover_image || "/placeholder.svg"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100px, 150px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 p-4">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div
                    className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium mb-1 ${getCategoryColor(
                      book.category_name || "",
                    )}`}
                  >
                    {book.category_name || "Uncategorized"}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">By {book.author}</p>

                  {book.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{book.description}</p>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getListingTypeBadgeVariant(book.listing_type)}>{book.listing_type}</Badge>
                    <Badge variant="outline">{book.condition}</Badge>
                    {book.listing_type === "Sell" && book.price && (
                      <span className="text-sm font-medium">${book.price.toFixed(2)}</span>
                    )}
                  </div>

                  {user ? (
                    <Button size="sm">View Details</Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href="/login">Sign in to view</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">No books found</h2>
        <p className="text-gray-500 mb-4">Try adjusting your filters or check back later</p>
        <Button onClick={resetFilters}>Reset Filters</Button>
      </div>
    )
  }

  // Render loading state
  const renderLoadingState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-500">Loading books...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Login CTA for non-authenticated users */}
      {!user && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6 shadow-sm mx-4 sm:mx-6 lg:mx-8 my-4">
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

      <main className="flex-1 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Browse Books</h1>

            <div className="mt-4 md:mt-0 flex items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ChevronDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                  <SelectItem value="author_asc">Author (A-Z)</SelectItem>
                  <SelectItem value="author_desc">Author (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Filter className="mr-2 h-5 w-5" /> Filters
                </h2>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Input
                        id="search"
                        placeholder="Title, author, or description"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Category filter */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listing Type filter */}
                  <div>
                    <label htmlFor="listing-type" className="block text-sm font-medium mb-2">
                      Listing Type
                    </label>
                    <Select value={listingType} onValueChange={setListingType}>
                      <SelectTrigger id="listing-type">
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

                  {/* Condition filter */}
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium mb-2">
                      Condition
                    </label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Any Condition" />
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

                  {/* Reset button */}
                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Books grid */}
            <div className="lg:col-span-3">
              {/* View toggle */}
              <div className="mb-6">
                <Tabs defaultValue="grid" value={activeView} onValueChange={setActiveView}>
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mt-4">
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Content for grid view */}
                  <TabsContent value="grid" className="mt-4">
                    {loading
                      ? renderLoadingState()
                      : filteredBooks.length === 0
                        ? renderEmptyState()
                        : renderGridView()}
                  </TabsContent>

                  {/* Content for list view */}
                  <TabsContent value="list" className="mt-4">
                    {loading
                      ? renderLoadingState()
                      : filteredBooks.length === 0
                        ? renderEmptyState()
                        : renderListView()}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
