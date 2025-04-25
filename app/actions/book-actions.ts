"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Define the valid conditions based on the database constraint
export const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"] as const

export type BookFormValues = {
  title: string
  author: string
  isbn?: string
  description?: string
  condition: string
  category_id: number
  listing_type: "sale" | "swap" | "donation"
  price?: number | null
  cover_image?: string
  user_id: string
}

export async function addBook(data: BookFormValues) {
  try {
    console.log("Server: Adding book with data:", data)

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient()

    // If user_id is provided from client, use it
    // This is a workaround for the session cookie issue
    const userId = data.user_id

    if (!userId) {
      console.error("Server: No user ID provided")
      return {
        success: false,
        error: "You must be logged in to add a book",
      }
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)

      // Try to create a profile automatically
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        username: `user_${Math.floor(Math.random() * 1000000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return {
          success: false,
          error: "Please create your profile before adding books",
          needsProfile: true,
        }
      }
    }

    // Create a unique ID for the book
    const bookId = uuidv4()

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      condition: data.condition,
      cover_image: data.cover_image || null,
      listing_type: data.listing_type,
      price: data.listing_type === "sale" ? data.price : null,
      owner_id: userId,
      category_id: data.category_id,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Server: Error adding book:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Revalidate the books page
    revalidatePath("/dashboard/books")

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Server: Exception adding book:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function getCategories() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("categories").select("id, name").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching categories:", error)
    return []
  }
}
