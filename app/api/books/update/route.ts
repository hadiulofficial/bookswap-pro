import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Define the valid conditions
const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"]

// Define the valid listing types that match the database constraint exactly
const VALID_LISTING_TYPES = ["sale", "swap", "donation"] as const

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { bookId, data } = body

    console.log("API: Received update request for bookId:", bookId, "with data:", data)

    if (!bookId || !data) {
      console.error("API: Missing required fields (bookId or data)")
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
      console.error("API: Book lookup error:", bookError)
      return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 })
    }

    if (existingBook.owner_id !== data.user_id) {
      console.error("API: Permission denied. Owner ID mismatch.")
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this book" },
        { status: 403 },
      )
    }

    // Convert incoming listing type to database format (lowercase)
    let listingType: (typeof VALID_LISTING_TYPES)[number]
    const incomingListingType = data.listing_type?.toLowerCase()

    switch (incomingListingType) {
      case "sale":
        listingType = "sale"
        break
      case "exchange": // UI value for swap
      case "swap": // Database value for swap
        listingType = "swap"
        break
      case "donation":
        listingType = "donation"
        break
      default:
        console.error(
          `API: Invalid listing type received: "${data.listing_type}". Expected one of: ${VALID_LISTING_TYPES.join(", ")}`,
        )
        return NextResponse.json(
          {
            success: false,
            error: `Invalid listing type: "${data.listing_type}". Must be 'sale', 'swap', or 'donation'`,
          },
          { status: 400 },
        )
    }

    console.log(`API: Converted listing type from UI "${data.listing_type}" to DB "${listingType}"`)

    // Prepare update data with proper null handling and trimming
    const updateData = {
      title: data.title?.trim() || "",
      author: data.author?.trim() || "",
      isbn: data.isbn?.trim() || null,
      description: data.description?.trim() || null,
      condition: data.condition,
      cover_image: data.cover_image || null,
      listing_type: listingType, // Use the converted value
      price: listingType === "sale" ? (data.price !== null && data.price !== undefined ? data.price : 0) : null,
      category_id: data.category_id,
      updated_at: new Date().toISOString(),
    }

    console.log("API: Prepared update data for database:", updateData)

    // Update the book in the database
    const { error } = await supabase.from("books").update(updateData).eq("id", bookId)

    if (error) {
      console.error("API: Error updating book in Supabase:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("API: Book updated successfully. Revalidating path.")
    // Revalidate the books page
    revalidatePath("/dashboard/books")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API: Exception during book update:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
