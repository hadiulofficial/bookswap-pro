"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getTestimonials() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Fetch all testimonials
    const { data: testimonials, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching testimonials:", error.message)
      return []
    }

    // If no testimonials, return empty array
    if (!testimonials || testimonials.length === 0) {
      return []
    }

    // Get all user IDs from testimonials
    const userIds = testimonials.map((testimonial) => testimonial.user_id)

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", userIds)

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError.message)
      return testimonials.map((testimonial) => ({ ...testimonial, profile: null }))
    }

    // Map profiles to testimonials
    const testimonialsWithProfiles = testimonials.map((testimonial) => {
      const profile = profiles?.find((profile) => profile.id === testimonial.user_id) || null
      return {
        ...testimonial,
        profile,
      }
    })

    return testimonialsWithProfiles
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

export async function getUserTestimonial() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError?.message || "No user found")
      return null
    }

    // Get the user's testimonial
    const { data: testimonial, error } = await supabase.from("testimonials").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      console.error("Error fetching user testimonial:", error.message)
      return null
    }

    return testimonial || null
  } catch (error) {
    console.error("Error fetching user testimonial:", error)
    return null
  }
}

export async function saveTestimonial(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError?.message || "No user found")
      return { success: false, message: "You must be logged in to leave a testimonial" }
    }

    // Get form data
    const content = formData.get("content") as string
    const rating = Number.parseInt(formData.get("rating") as string)

    // Validate form data
    if (!content || content.trim().length === 0) {
      return { success: false, message: "Please enter a review" }
    }

    if (content.length > 500) {
      return { success: false, message: "Review must be less than 500 characters" }
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, message: "Please select a rating between 1 and 5" }
    }

    // Check if user already has a testimonial
    const { data: existingTestimonial, error: checkError } = await supabase
      .from("testimonials")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing testimonial:", checkError.message)
      return { success: false, message: "An error occurred. Please try again." }
    }

    let result

    if (existingTestimonial) {
      // Update existing testimonial
      result = await supabase
        .from("testimonials")
        .update({
          content,
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTestimonial.id)
    } else {
      // Create new testimonial
      result = await supabase.from("testimonials").insert({
        user_id: user.id,
        content,
        rating,
      })
    }

    if (result.error) {
      console.error("Error saving testimonial:", result.error.message)
      return { success: false, message: "An error occurred while saving your review. Please try again." }
    }

    return { success: true, message: "Your review has been saved successfully!" }
  } catch (error) {
    console.error("Error saving testimonial:", error)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteTestimonial() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError?.message || "No user found")
      return { success: false, message: "You must be logged in to delete a testimonial" }
    }

    // Delete the testimonial
    const { error } = await supabase.from("testimonials").delete().eq("user_id", user.id)

    if (error) {
      console.error("Error deleting testimonial:", error.message)
      return { success: false, message: "An error occurred while deleting your review. Please try again." }
    }

    return { success: true, message: "Your review has been deleted successfully!" }
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}
