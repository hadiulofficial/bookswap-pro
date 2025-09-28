import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, data } = body

    console.log("API: Received update request for bookId:", bookId)
    console.log("API: Update data:", data)

    if (!bookId || !data) {
      console.error("API: Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if the book exists and belongs to the user
    const { data: existingBook, error: bookError } = await supabase
      .from("books")
      .select("id, owner_id, listing_type")
      .eq("id", bookId)
      .single()

    if (bookError) {
      console.error("API: Book lookup error:", bookError)
      return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 })
    }

    if (existingBook.owner_id !== data.user_id) {
      console.error("API: Permission denied")
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this book" },
        { status: 403 },
      )
    }

    // Ensure listing_type is one of the valid values
    const validListingTypes = ["sale", "swap", "donation"]
    let listingType = data.listing_type?.toLowerCase()

    if (!validListingTypes.includes(listingType)) {
      console.warn(`API: Invalid listing type "${data.listing_type}", defaulting to "swap"`)
      listingType = "swap"
    }

    console.log(`API: Using listing type: "${listingType}"`)

    const updateData = {
      title: data.title?.trim() || "",
      author: data.author?.trim() || "",
      isbn: data.isbn?.trim() || null,
      description: data.description?.trim() || null,
      condition: data.condition || "Good",
      cover_image: data.cover_image || null,
      listing_type: listingType,
      price: listingType === "sale" ? data.price || 0 : null,
      category_id: data.category_id || 1,
      updated_at: new Date().toISOString(),
    }

    console.log("API: Final update data:", updateData)

    const { error } = await supabase.from("books").update(updateData).eq("id", bookId)

    if (error) {
      console.error("API: Supabase update error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("API: Book updated successfully")
    revalidatePath("/dashboard/books")
    revalidatePath(`/books/${bookId}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API: Exception during book update:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
