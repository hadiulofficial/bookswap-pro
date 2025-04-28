import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Define the valid conditions
const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"]

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { bookId, data } = body

    if (!bookId || !data) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Check if the book exists and belongs to the user
    const { data: existingBook, error: bookError } = await supabase
      .from("books")
      .select("id, owner_id")
      .eq("id", bookId)
      .single()

    if (bookError) {
      console.error("Book error:", bookError)
      return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 })
    }

    if (existingBook.owner_id !== data.user_id) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this book" },
        { status: 403 },
      )
    }

    // Convert listing type to database format
    let listingType = typeof data.listing_type === "string" ? data.listing_type.toLowerCase() : data.listing_type
    if (listingType === "exchange") listingType = "swap"

    // Prepare update data with proper null handling
    const updateData = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      condition: data.condition,
      cover_image: data.cover_image || null,
      listing_type: listingType,
      price: listingType === "sale" ? data.price || 0 : null,
      category_id: data.category_id,
      updated_at: new Date().toISOString(),
    }

    // Update the book in the database
    const { error } = await supabase.from("books").update(updateData).eq("id", bookId)

    if (error) {
      console.error("Server: Error updating book:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Revalidate the books page
    revalidatePath("/dashboard/books")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server: Exception updating book:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
