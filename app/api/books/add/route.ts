import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.author || !data.owner_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Create a unique ID for the book
    const bookId = uuidv4()

    // Log the data being sent to the database
    console.log("Inserting book with data:", {
      id: bookId,
      title: data.title,
      author: data.author,
      condition: data.condition || "Good",
      listing_type: data.listing_type || "exchange", // Changed from "swap" to "exchange"
      owner_id: data.owner_id,
      category_id: data.category_id || 1,
      status: "available",
    })

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: data.title,
      author: data.author,
      condition: data.condition || "Good",
      listing_type: data.listing_type || "exchange", // Changed from "swap" to "exchange"
      owner_id: data.owner_id,
      category_id: data.category_id || 1,
      status: "available",
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
