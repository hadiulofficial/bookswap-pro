import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BooksPageClient } from "./books-page-client"

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
  categories: {
    name: string
  }
}

interface BooksPageProps {
  searchParams: {
    page?: string
    search?: string
    category?: string
    status?: string
  }
}

async function getBooks(userId: string, searchParams: BooksPageProps["searchParams"]) {
  const supabase = createServerComponentClient({ cookies })

  let query = supabase.from("books").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.search) {
    query = query.or(
      `title.ilike.%${searchParams.search}%,author.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`,
    )
  }

  if (searchParams.category && searchParams.category !== "all") {
    query = query.eq("category_id", searchParams.category)
  }

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status)
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

async function getCategories() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const page = Number.parseInt(searchParams.page || "1")
  const search = searchParams.search || ""
  const category = searchParams.category || ""
  const status = searchParams.status || ""
  const limit = 12
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from("books")
    .select(
      `
      *,
      categories (
        name
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq("category_id", category)
  }

  if (status) {
    query = query.eq("status", status)
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: books, error, count } = await query

  if (error) {
    console.error("Error fetching books:", error)
  }

  // Get categories for filter
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
          <p className="text-muted-foreground">Manage your book collection</p>
        </div>
        <Link href="/dashboard/books/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </Link>
      </div>

      <BooksPageClient
        initialBooks={books || []}
        categories={categories || []}
        totalPages={totalPages}
        currentPage={page}
        initialSearch={search}
        initialCategory={category}
        initialStatus={status}
      />
    </div>
  )
}
