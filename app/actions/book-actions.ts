"use server"

import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the form schema with Zod using the EXACT values from the database constraint
const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  // Use the exact values from the database constraint
  condition: z.enum(["New", "Like New", "Very Good", "Good", "Acceptable"], {
    required_error: "Please select a condition",
  }),
  category_id: z.coerce.number({
    required_error: "Please select a category",
  }),
  listing_type: z.enum(["sale", "swap", "donation"], {
    required_error: "Please select a listing type",
  }),
  price: z.coerce.number().min(0, "Price must be a positive number").optional().nullable(),
  cover_image: z.string().optional(),
  user_id: z.string().min(1, "User ID is required"),
})

export type BookFormValues = z.infer<typeof bookFormSchema>

export async function addBook(formData: BookFormValues) {
  try {
    console.log("Starting addBook server action")
    console.log("Form data received:", formData)

    // Validate form data
    const validatedData = bookFormSchema.parse(formData)

    // If listing type is not sale, ensure price is null
    if (validatedData.listing_type !== "sale") {
      validatedData.price = null
    }

    // Get the user ID from the form data
    const userId = validatedData.user_id

    if (!userId) {
      console.error("No user ID provided")
      return { success: false, error: "You must be logged in to add a book" }
    }

    console.log("Using user ID from form data:", userId)

    // Get the Supabase admin client
    const supabase = createServerSupabaseClient()

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
    console.log("Generated book ID:", bookId)

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: validatedData.title,
      author: validatedData.author,
      isbn: validatedData.isbn || null,
      description: validatedData.description || null,
      condition: validatedData.condition, // Now using the correct value from the form
      cover_image: validatedData.cover_image || null,
      listing_type: validatedData.listing_type,
      price: validatedData.price,
      owner_id: userId,
      category_id: validatedData.category_id,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding book:", error)
      return { success: false, error: error.message }
    }

    console.log("Book added successfully with ID:", bookId)

    // Revalidate the books page to show the new book
    revalidatePath("/dashboard/books")

    return { success: true }
  } catch (error: any) {
    console.error("Error in addBook action:", error)
    return {
      success: false,
      error: error.message || "Failed to add book. Please try again.",
    }
  }
}

export async function getCategories() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("id, name").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

// Valid conditions from the database constraint
export const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"]
