"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addToWishlist(userId: string, bookId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the book is already in the wishlist
    const { data: existingWishlist, error: checkError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking wishlist:", checkError)
      return {
        success: false,
        error: "Failed to check wishlist status",
      }
    }

    // If already in wishlist, return success
    if (existingWishlist) {
      return {
        success: true,
        message: "Book is already in your wishlist",
      }
    }

    // Add to wishlist
    const { error } = await supabase.from("wishlists").insert({
      user_id: userId,
      book_id: bookId,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding to wishlist:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/wishlist")
    revalidatePath("/books")

    return {
      success: true,
      message: "Book added to wishlist",
    }
  } catch (error: any) {
    console.error("Exception adding to wishlist:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function removeFromWishlist(userId: string, bookId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("wishlists").delete().eq("user_id", userId).eq("book_id", bookId)

    if (error) {
      console.error("Error removing from wishlist:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/wishlist")
    revalidatePath("/books")

    return {
      success: true,
      message: "Book removed from wishlist",
    }
  } catch (error: any) {
    console.error("Exception removing from wishlist:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function getWishlist(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id, 
        created_at,
        books (
          id, 
          title, 
          author, 
          description, 
          condition, 
          cover_image, 
          listing_type, 
          price,
          owner_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching wishlist:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching wishlist:", error)
    return []
  }
}

export async function isBookInWishlist(userId: string, bookId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking wishlist:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Exception checking wishlist:", error)
    return false
  }
}
