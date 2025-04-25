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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (existingProfile) {
      return NextResponse.json({ message: "Profile already exists" })
    }

    // Create a new profile
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      username: `user_${Math.floor(Math.random() * 1000000)}`,
    })

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    return NextResponse.json({ message: "Profile created successfully" })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
