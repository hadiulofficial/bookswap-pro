import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "You must be logged in to add a book" }, { status: 401 })
    }

    // Get the request body
    const { title, author, description = "", condition = "Good", listingType = "Exchange" } = await request.json()

    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    // Important: Use correct capitalization for listing_type and status
    const { data, error } = await supabase
      .from("books")
      .insert({
        title,
        author,
        description,
        condition,
        listing_type: listingType, // Will be capitalized in the client
        owner_id: session.user.id,
        status: "Available", // Correctly capitalized
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error adding book:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
