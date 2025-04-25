import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    // Get the request body
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    // Create Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, return error
    if (!session) {
      console.error("No session found in cookies")
      return NextResponse.json({ error: "You must be logged in to add a book" }, { status: 401 })
    }

    // Use the user ID from the session
    const userId = session.user.id

    // Create a unique ID for the book
    const bookId = uuidv4()

    // Log the data being sent to the database
    console.log("Inserting book with data:", {
      id: bookId,
      title: data.title,
      author: data.author,
      description: data.description || "",
      condition: data.condition || "Good",
      listing_type: "Exchange", // Correctly capitalized
      owner_id: userId,
      category_id: data.category_id || 1,
      status: "Available", // Correctly capitalized
    })

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: data.title,
      author: data.author,
      description: data.description || "",
      condition: data.condition || "Good",
      listing_type: "Exchange", // Correctly capitalized
      owner_id: userId,
      category_id: data.category_id || 1,
      status: "Available", // Correctly capitalized
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding book:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: bookId })
  } catch (error: any) {
    console.error("Exception adding book:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
