"use server"

import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the form schema with Zod
const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(["new", "like-new", "very-good", "good", "fair", "poor"], {
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
})

export type BookFormValues = z.infer<typeof bookFormSchema>

export async function addBook(formData: BookFormValues) {
  try {
    // Validate form data
    const validatedData = bookFormSchema.parse(formData)

    // If listing type is not sale, ensure price is null
    if (validatedData.listing_type !== "sale") {
      validatedData.price = null
    }

    // Get the current user
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("Authentication error: No user found in session")
      return { success: false, error: "You must be logged in to add a book" }
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile error:", profileError || "No profile found for user")
      return {
        success: false,
        error: "Please complete your profile before adding books",
        needsProfile: true,
      }
    }

    // Log the user ID to help with debugging
    console.log("User authenticated with ID:", user.id)

    // Add the book to the database
    const { error } = await supabase.from("books").insert({
      id: uuidv4(),
      title: validatedData.title,
      author: validatedData.author,
      isbn: validatedData.isbn || null,
      description: validatedData.description || null,
      condition: validatedData.condition,
      cover_image: validatedData.cover_image || null,
      listing_type: validatedData.listing_type,
      price: validatedData.price,
      owner_id: user.id,
      category_id: validatedData.category_id,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding book:", error)
      return { success: false, error: error.message }
    }

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
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.from("categories").select("id, name").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}
