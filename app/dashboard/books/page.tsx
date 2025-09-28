import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { BooksPageClient } from "./books-page-client"

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string; listing_type?: string }
}) {
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
  const listing_type = searchParams.listing_type || ""
  const limit = 12
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from("books")
    .select(
      `
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq("category", category)
  }

  if (listing_type) {
    query = query.eq("listing_type", listing_type)
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: books, error, count } = await query

  if (error) {
    console.error("Error fetching books:", error)
  }

  // Get categories for filter
  const { data: categories } = await supabase
    .from("books")
    .select("category")
    .eq("user_id", session.user.id)
    .not("category", "is", null)

  const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])]

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <BooksPageClient
      books={books || []}
      totalPages={totalPages}
      currentPage={page}
      categories={uniqueCategories}
      initialSearch={search}
      initialCategory={category}
      initialListingType={listing_type}
    />
  )
}
