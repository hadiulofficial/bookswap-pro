import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received update request:", body)

    const { id, title, author, description, category_id, condition, listing_type, price, status, image_url } = body

    // Validate required fields
    if (!id || !title || !author || !category_id || !condition || !listing_type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate listing_type against expected values
    const validListingTypes = ["sale", "swap", "donation"]
    let listing_type_value = listing_type
    if (!validListingTypes.includes(listing_type_value)) {
      console.log(`Invalid listing_type: ${listing_type_value}, defaulting to 'sale'`)
      // Default to 'sale' if invalid
      listing_type_value = "sale"
    }

    // Validate condition
    const validConditions = ["new", "like_new", "good", "fair", "poor"]
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { error: `Invalid condition. Must be one of: ${validConditions.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate status
    const validStatuses = ["available", "sold", "reserved"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      )
    }

    // Prepare update data
    const updateData = {
      title,
      author,
      description: description || null,
      category_id,
      condition,
      listing_type: listing_type_value,
      price: listing_type_value === "sale" && price ? Number.parseFloat(price) : null,
      status,
      image_url: image_url || null,
      updated_at: new Date().toISOString(),
    }

    console.log("Updating book with data:", updateData)

    // First, verify the book exists and belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("id, user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existingBook) {
      console.error("Book not found:", fetchError)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (existingBook.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to update this book" }, { status: 403 })
    }

    // Update the book
    const { data, error } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)

      // Handle specific constraint violations
      if (error.message.includes("books_listing_type_check")) {
        return NextResponse.json(
          {
            error: 'Invalid listing type. Please use "sale", "swap", or "donation".',
            details: error.message,
          },
          { status: 400 },
        )
      }

      if (error.message.includes("books_condition_check")) {
        return NextResponse.json(
          {
            error: 'Invalid condition. Please use "new", "like_new", "good", "fair", or "poor".',
            details: error.message,
          },
          { status: 400 },
        )
      }

      if (error.message.includes("books_status_check")) {
        return NextResponse.json(
          {
            error: 'Invalid status. Please use "available", "sold", or "reserved".',
            details: error.message,
          },
          { status: 400 },
        )
      }

      return NextResponse.json({ error: "Failed to update book", details: error.message }, { status: 500 })
    }

    console.log("Book updated successfully:", data)

    return NextResponse.json({
      message: "Book updated successfully",
      book: data,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
