"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createUserProfile() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No authenticated user found during profile creation")
      return { success: false, error: "Not authenticated" }
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
      return { success: false, error: "Failed to check for existing profile" }
    }

    if (existingProfile) {
      console.log("Profile already exists for user:", user.id)
      return { success: true, message: "Profile already exists" }
    }

    // Create a new profile with minimal required fields
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: `user_${Math.floor(Math.random() * 1000000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)
      return { success: false, error: "Failed to create profile: " + error.message }
    }

    // Revalidate paths that might display user profile data
    revalidatePath("/dashboard")
    revalidatePath("/profile")

    console.log("Profile created successfully for user:", user.id)
    return { success: true, message: "Profile created successfully" }
  } catch (error: any) {
    console.error("Server error during profile creation:", error)
    return { success: false, error: error.message || "Internal server error" }
  }
}
