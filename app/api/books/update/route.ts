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
    const { id, ...updateData } = body

    console.log("API: Updating book with ID:", id)
    console.log("API: Update data:", updateData)
    console.log("API: Listing type:", updateData.listing_type)

    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Validate listing_type
    const validListingTypes = ["sale", "swap", "donation"]
    if (!validListingTypes.includes(updateData.listing_type)) {
      console.log("API: Invalid listing type, defaulting to sale")
      updateData.listing_type = "sale"
    }

    // Ensure price is null for non-sale items
    if (updateData.listing_type !== "sale") {
      updateData.price = null
    }

    // First, verify the book exists and belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !existingBook) {
      console.error("API: Book not found or access denied:", fetchError)
      return NextResponse.json({ error: "Book not found or access denied" }, { status: 404 })
    }

    // Update the book
    const { data, error } = await supabase
      .from("books")
      .update({
        title: updateData.title,
        author: updateData.author,
        isbn: updateData.isbn,
        category: updateData.category,
        condition: updateData.condition,
        description: updateData.description,
        listing_type: updateData.listing_type,
        price: updateData.price,
        image_url: updateData.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("API: Database error:", error)

      // Handle specific constraint violations
      if (error.message.includes("books_listing_type_check")) {
        return NextResponse.json(
          {
            error: "Invalid listing type. Please select Sale, Swap, or Donation.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: `Database error: ${error.message}`,
        },
        { status: 500 },
      )
    }

    console.log("API: Book updated successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
