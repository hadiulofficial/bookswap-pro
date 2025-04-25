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

    // If no session, try to get it using the service role key as a fallback
    if (!session) {
      console.log("No session found in cookies, attempting to use service role key")

      // Create a new Supabase client with the service role key
      const serviceRoleSupabase = createRouteHandlerClient(
        { cookies },
        {
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
      )

      // Try to get the user from the request headers (Authorization: Bearer token)
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        const { data: userData } = await serviceRoleSupabase.auth.getUser(token)

        if (userData?.user) {
          console.log("User authenticated via token:", userData.user.id)
          // Continue with the user from the token
          const { title, author, description = "", condition = "Good", listingType = "Exchange" } = await request.json()

          if (!title || !author) {
            return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
          }

          const { data, error } = await serviceRoleSupabase
            .from("books")
            .insert({
              title,
              author,
              description,
              condition,
              listing_type: listingType, // Will be capitalized in the client
              owner_id: userData.user.id,
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
        }
      }

      return NextResponse.json({ error: "You must be logged in to add a book" }, { status: 401 })
    }

    // Get the request body
    const { title, author, description = "", condition = "Good", listingType = "Exchange" } = await request.json()

    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    console.log("Adding book for user:", session.user.id)
    console.log("Book data:", { title, author, description, condition, listingType })

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
