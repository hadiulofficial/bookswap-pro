import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BooksPageClient } from "./books-page-client"

async function getBooks(page = 1, search?: string, category?: string, listingType?: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    let query = supabase
      .from("books")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (listingType && listingType !== "all") {
      query = query.eq("listing_type", listingType)
    }

    const itemsPerPage = 10
    const offset = (page - 1) * itemsPerPage

    query = query.range(offset, offset + itemsPerPage - 1)

    const { data: books, error, count } = await query

    if (error) {
      console.error("Error fetching books:", error)
      return { books: [], totalPages: 0, currentPage: page }
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage)

    return {
      books: books || [],
      totalPages,
      currentPage: page,
    }
  } catch (error) {
    console.error("Error in getBooks:", error)
    return { books: [], totalPages: 0, currentPage: page }
  }
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(searchParams.page) || 1
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const listingType = typeof searchParams.listing_type === "string" ? searchParams.listing_type : undefined

  const { books, totalPages, currentPage } = await getBooks(page, search, category, listingType)

  return (
    <BooksPageClient
      initialBooks={books}
      totalPages={totalPages}
      currentPage={currentPage}
      initialSearch={search || ""}
      initialCategory={category || "all"}
      initialListingType={listingType || "all"}
    />
  )
}
