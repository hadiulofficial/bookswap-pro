import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No authenticated user found during profile creation")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Creating profile for user:", user.id)

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" - that's expected if profile doesn't exist
      console.error("Error checking for existing profile:", profileError)
      return NextResponse.json({ error: "Failed to check for existing profile" }, { status: 500 })
    }

    if (existingProfile) {
      console.log("Profile already exists for user:", user.id)
      return NextResponse.json({ message: "Profile already exists" })
    }

    // Create a new profile
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      username: `user_${Math.floor(Math.random() * 1000000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    console.log("Profile created successfully for user:", user.id)
    return NextResponse.json({ message: "Profile created successfully" })
  } catch (error) {
    console.error("Server error during profile creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
