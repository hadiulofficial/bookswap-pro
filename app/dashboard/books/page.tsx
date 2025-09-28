import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react"
import Image from "next/image"

interface Book {
  id: string
  title: string
  author: string
  genre: string
  condition: string
  listing_type: string
  price: number | null
  description: string
  image_url: string | null
  created_at: string
  status: string
}

interface BooksPageProps {
  searchParams: {
    search?: string
    genre?: string
    condition?: string
    listing_type?: string
    page?: string
  }
}

async function getBooks(userId: string, searchParams: BooksPageProps["searchParams"]) {
  const supabase = createServerComponentClient({ cookies })

  let query = supabase.from("books").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,author.ilike.%${searchParams.search}%`)
  }

  if (searchParams.genre && searchParams.genre !== "all") {
    query = query.eq("genre", searchParams.genre)
  }

  if (searchParams.condition && searchParams.condition !== "all") {
    query = query.eq("condition", searchParams.condition)
  }

  if (searchParams.listing_type && searchParams.listing_type !== "all") {
    query = query.eq("listing_type", searchParams.listing_type)
  }

  // Pagination
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to)

  const { data: books, error, count } = await query

  if (error) {
    console.error("Error fetching books:", error)
    return { books: [], totalCount: 0 }
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  return { books: books || [], totalCount: totalCount || 0 }
}

async function getGenres() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("books").select("genre").not("genre", "is", null)

  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }

  const uniqueGenres = [...new Set(data?.map((book) => book.genre) || [])]
  return uniqueGenres.filter(Boolean)
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const [{ books, totalCount }, genres] = await Promise.all([getBooks(user.id, searchParams), getGenres()])

  const currentPage = Number.parseInt(searchParams.page || "1")
  const totalPages = Math.ceil(totalCount / 12)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
          <p className="text-muted-foreground">Manage your book collection and listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Link>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search Books
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or author..."
                  className="pl-10"
                  defaultValue={searchParams.search || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="genre" className="text-sm font-medium">
                Genre
              </label>
              <Select defaultValue={searchParams.genre || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="condition" className="text-sm font-medium">
                Condition
              </label>
              <Select defaultValue={searchParams.condition || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="listing_type" className="text-sm font-medium">
                Listing Type
              </label>
              <Select defaultValue={searchParams.listing_type || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchParams.search || searchParams.genre || searchParams.condition || searchParams.listing_type
                ? "Try adjusting your search filters or add your first book."
                : "You haven't added any books yet. Start building your collection!"}
            </p>
            <Button asChild>
              <Link href="/dashboard/books/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Book
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild>
                <Link href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) }).toString()}`}>
                  Previous
                </Link>
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" asChild>
                      <Link href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  )
                })}
              </div>

              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} asChild>
                <Link href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) }).toString()}`}>
                  Next
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {books.length} of {totalCount} books
      </div>
    </div>
  )
}

function BookCard({ book }: { book: Book }) {
  const getListingTypeColor = (type: string) => {
    switch (type) {
      case "sale":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "exchange":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "donation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "like_new":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "good":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "fair":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
        {book.image_url ? (
          <Image
            src={book.image_url || "/placeholder.svg"}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge className={getListingTypeColor(book.listing_type)}>
            {book.listing_type === "sale" ? "Sale" : book.listing_type === "exchange" ? "Exchange" : "Donation"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
        <CardDescription className="line-clamp-1">by {book.author}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getConditionColor(book.condition)}>
            {book.condition.replace("_", " ")}
          </Badge>
          {book.listing_type === "sale" && book.price && <span className="font-semibold text-lg">${book.price}</span>}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/books/${book.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/books/edit/${book.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive bg-transparent">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
