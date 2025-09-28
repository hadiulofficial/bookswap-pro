import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Update request body:", body)

    const { id, title, author, genre, condition, listing_type, price, description, image_url } = body

    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Validate required fields
    if (!title || !author || !genre || !condition || !listing_type) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, author, genre, condition, listing_type",
        },
        { status: 400 },
      )
    }

    // Validate listing_type against expected values
    const validListingTypes = ["sale", "exchange", "donation"]
    if (!validListingTypes.includes(listing_type)) {
      console.error("Invalid listing_type:", listing_type)
      return NextResponse.json(
        {
          error: `Invalid listing_type. Must be one of: ${validListingTypes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validate condition against expected values
    const validConditions = ["new", "like_new", "good", "fair", "poor"]
    if (!validConditions.includes(condition)) {
      console.error("Invalid condition:", condition)
      return NextResponse.json(
        {
          error: `Invalid condition. Must be one of: ${validConditions.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Prepare the update data
    const updateData = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      condition,
      listing_type,
      price: listing_type === "sale" && price ? Number.parseFloat(price) : null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    console.log("Prepared update data:", updateData)

    // First, verify the book exists and belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingBook) {
      console.error("Book not found or access denied:", fetchError)
      return NextResponse.json(
        {
          error: "Book not found or you do not have permission to edit it",
        },
        { status: 404 },
      )
    }

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

      // Handle specific constraint violations
      if (updateError.message?.includes("books_listing_type_check")) {
        return NextResponse.json(
          {
            error: "Invalid listing type. Please select a valid option and try again.",
          },
          { status: 400 },
        )
      }

      if (updateError.message?.includes("books_condition_check")) {
        return NextResponse.json(
          {
            error: "Invalid condition. Please select a valid option and try again.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to update book. Please try again.",
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
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}
