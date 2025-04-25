import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received data:", data)

    // Validate required fields
    if (!data.title || !data.author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient()

    // First, let's query the database to find out what values are allowed for listing_type
    const { data: tableInfo, error: tableError } = await supabase.from("books").select("listing_type").limit(1)

    console.log("Table info query result:", tableInfo, tableError)

    // Try with a direct SQL query to get constraint info
    const { data: constraintInfo, error: constraintError } = await supabase.rpc("get_constraint_info", {
      table_name: "books",
      column_name: "listing_type",
    })

    console.log("Constraint info:", constraintInfo, constraintError)

    // Try all possible common values
    const possibleTypes = ["sale", "exchange", "donation", "trade", "swap", "free", "rent", "borrow"]
    let success = false
    const errorMessages = []

    // Try each possible value until one works
    for (const type of possibleTypes) {
      const { error } = await supabase
        .from("books")
        .insert({
          title: data.title,
          author: data.author,
          condition: "Good",
          listing_type: type,
          owner_id: data.user_id || "00000000-0000-0000-0000-000000000000", // Use a default UUID if none provided
          status: "available",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (!error) {
        console.log(`Success with listing_type: ${type}`)
        success = true
        return NextResponse.json({
          success: true,
          message: `Book added successfully with listing_type: ${type}`,
        })
      } else {
        errorMessages.push(`Failed with ${type}: ${error.message}`)
        console.log(`Failed with listing_type: ${type}`, error)
      }
    }

    // If we get here, none of the values worked
    return NextResponse.json(
      {
        error: "Could not determine valid listing_type value",
        attempts: errorMessages,
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("Exception adding book:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
