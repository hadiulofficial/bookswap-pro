import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Update request body:", body)

    const { id, title, author, description, price, category, listing_type, condition, image_url } = body

    // Validate required fields
    if (!id || !title || !author || !category || !listing_type) {
      return NextResponse.json(
        {
          error: "Missing required fields: id, title, author, category, listing_type",
        },
        { status: 400 },
      )
    }

    // Validate listing_type against expected values
    const validListingTypes = ["sale", "swap", "donation"]
    let listing_type_value = listing_type
    if (!validListingTypes.includes(listing_type_value)) {
      console.log(`Invalid listing_type: ${listing_type_value}. Defaulting to 'sale'`)
      // Default to 'sale' if invalid
      listing_type_value = "sale"
    }

    // First, verify the book belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existingBook) {
      console.log("Book fetch error:", fetchError)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (existingBook.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      title,
      author,
      description: description || null,
      category,
      listing_type: listing_type_value,
      condition: condition || null,
      image_url: image_url || null,
      updated_at: new Date().toISOString(),
    }

    // Only include price for sale items
    if (listing_type_value === "sale" && price !== null && price !== undefined && price !== "") {
      updateData.price = Number.parseFloat(price.toString())
    } else {
      updateData.price = null
    }

    console.log("Final update data:", updateData)

    // Update the book
    const { data: updatedBook, error: updateError } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json(
        {
          error: `Failed to update book: ${updateError.message}`,
          details: updateError,
        },
        { status: 500 },
      )
    }

    console.log("Book updated successfully:", updatedBook)

    return NextResponse.json({
      message: "Book updated successfully",
      book: updatedBook,
    })
  } catch (error) {
    console.error("Unexpected error in book update:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
