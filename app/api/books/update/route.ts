import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Define the valid conditions
const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"]

// Define the valid listing types that match the database constraint
const VALID_LISTING_TYPES = ["sale", "swap", "donation"]

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
    let listingType = data.listing_type?.toLowerCase() || "sale"

    // Map "exchange" to "swap" to match database constraint
    if (listingType === "exchange") {
      listingType = "swap"
    }

    // Validate that the listing type is one of the allowed values
    if (!VALID_LISTING_TYPES.includes(listingType)) {
      console.error(`Invalid listing type: ${listingType}. Must be one of: ${VALID_LISTING_TYPES.join(", ")}`)
      return NextResponse.json(
        { success: false, error: `Invalid listing type. Must be one of: ${VALID_LISTING_TYPES.join(", ")}` },
        { status: 400 },
      )
    }

    console.log("Using listing type:", listingType)

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
