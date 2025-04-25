"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the valid conditions based on the database constraint
export const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"] as const

export type BookFormValues = {
  title: string
  author: string
  isbn?: string
  description?: string
  condition: (typeof VALID_CONDITIONS)[number]
  category_id: number
  listing_type: "sale" | "swap" | "donation"
  price?: number | null
  cover_image?: string
  user_id?: string
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

    // Prepare the book data
    const bookData = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      condition: data.condition,
      category_id: data.category_id,
      listing_type: data.listing_type,
      price: data.listing_type === "sale" ? data.price : null,
      cover_image: data.cover_image || null,
      user_id: userId,
    }

    console.log("Server: Inserting book with data:", bookData)

    // Insert the book
    const { data: book, error } = await supabase.from("books").insert(bookData).select().single()

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
      book,
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
