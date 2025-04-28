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
  listing_type: "Sale" | "Exchange" | "Donation" | "sale" | "swap" | "donation"
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

    // Convert listing type to database format
    let listingType = typeof data.listing_type === "string" ? data.listing_type.toLowerCase() : data.listing_type
    if (listingType === "exchange") listingType = "swap"

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      condition: data.condition,
      cover_image: data.cover_image || null,
      listing_type: listingType,
      price: listingType === "sale" ? data.price : null,
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

export async function updateBook(bookId: string, data: BookFormValues) {
  try {
    console.log("Server: Updating book with data:", data)

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient()

    // If user_id is provided from client, use it
    const userId = data.user_id

    if (!userId) {
      console.error("Server: No user ID provided")
      return {
        success: false,
        error: "You must be logged in to update a book",
      }
    }

    // Check if the book exists and belongs to the user
    const { data: existingBook, error: bookError } = await supabase
      .from("books")
      .select("id, owner_id")
      .eq("id", bookId)
      .single()

    if (bookError) {
      console.error("Book error:", bookError)
      return {
        success: false,
        error: "Book not found",
      }
    }

    if (existingBook.owner_id !== userId) {
      return {
        success: false,
        error: "You don't have permission to update this book",
      }
    }

    // Convert listing type to database format
    let listingType = typeof data.listing_type === "string" ? data.listing_type.toLowerCase() : data.listing_type
    if (listingType === "exchange") listingType = "swap"

    console.log("Converted listing type:", listingType)

    // Prepare update data with proper null handling
    const updateData = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      condition: data.condition,
      cover_image: data.cover_image || null,
      listing_type: listingType,
      price: listingType === "sale" ? data.price || 0 : null,
      category_id: data.category_id,
      updated_at: new Date().toISOString(),
    }

    // Update the book in the database
    const { error } = await supabase.from("books").update(updateData).eq("id", bookId)

    if (error) {
      console.error("Server: Error updating book:", error)
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
    console.error("Server: Exception updating book:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function getBook(bookId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("books").select("*").eq("id", bookId).single()

    if (error) {
      console.error("Error fetching book:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception fetching book:", error)
    return null
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
