"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Get user's books available for swap
export async function getUserBooksForSwap(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("owner_id", userId)
      .eq("listing_type", "swap")
      .eq("status", "available")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user's books for swap:", error)
      return { success: false, error: error.message, books: [] }
    }

    return { success: true, books: data || [] }
  } catch (error: any) {
    console.error("Exception fetching user's books for swap:", error)
    return { success: false, error: error.message || "An unexpected error occurred", books: [] }
  }
}

// Check if a swap request already exists
export async function checkExistingSwapRequest(requestedBookId: string, requesterId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("swap_requests")
      .select("*")
      .eq("requested_book_id", requestedBookId)
      .eq("requester_id", requesterId)
      .eq("status", "pending")
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking existing swap request:", error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, request: data || null }
  } catch (error: any) {
    console.error("Exception checking existing swap request:", error)
    return { exists: false, error: error.message || "An unexpected error occurred" }
  }
}

// Create a swap request
export async function createSwapRequest(
  requestedBookId: string,
  offeredBookId: string,
  requesterId: string,
  ownerId: string,
) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if a pending request already exists
    const { exists, error: checkError } = await checkExistingSwapRequest(requestedBookId, requesterId)

    if (checkError) {
      return { success: false, error: checkError }
    }

    if (exists) {
      return { success: false, error: "You already have a pending swap request for this book" }
    }

    // Create a unique ID for the swap request
    const swapRequestId = uuidv4()

    // Create the swap request
    const { error } = await supabase.from("swap_requests").insert({
      id: swapRequestId,
      requested_book_id: requestedBookId,
      offered_book_id: offeredBookId,
      requester_id: requesterId,
      owner_id: ownerId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating swap request:", error)
      return { success: false, error: error.message }
    }

    // Revalidate relevant paths
    revalidatePath(`/books/${requestedBookId}`)
    revalidatePath("/dashboard/swap-requests")

    return { success: true, swapRequestId }
  } catch (error: any) {
    console.error("Exception creating swap request:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Get swap requests for a user (both as requester and owner)
export async function getUserSwapRequests(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get requests where user is the requester
    const { data: sentRequests, error: sentError } = await supabase
      .from("swap_requests")
      .select(
        `
        *,
        requested_book:requested_book_id(id, title, author, cover_image, owner_id),
        offered_book:offered_book_id(id, title, author, cover_image, owner_id)
      `,
      )
      .eq("requester_id", userId)
      .order("created_at", { ascending: false })

    if (sentError) {
      console.error("Error fetching sent swap requests:", sentError)
      return { success: false, error: sentError.message, sentRequests: [], receivedRequests: [] }
    }

    // Get requests where user is the owner
    const { data: receivedRequests, error: receivedError } = await supabase
      .from("swap_requests")
      .select(
        `
        *,
        requested_book:requested_book_id(id, title, author, cover_image, owner_id),
        offered_book:offered_book_id(id, title, author, cover_image, owner_id)
      `,
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (receivedError) {
      console.error("Error fetching received swap requests:", receivedError)
      return { success: false, error: receivedError.message, sentRequests: [], receivedRequests: [] }
    }

    return {
      success: true,
      sentRequests: sentRequests || [],
      receivedRequests: receivedRequests || [],
    }
  } catch (error: any) {
    console.error("Exception fetching user's swap requests:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      sentRequests: [],
      receivedRequests: [],
    }
  }
}

// Update swap request status
export async function updateSwapRequestStatus(swapRequestId: string, status: "accepted" | "rejected", userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the user is the owner of the requested book
    const { data: swapRequest, error: fetchError } = await supabase
      .from("swap_requests")
      .select("*")
      .eq("id", swapRequestId)
      .single()

    if (fetchError) {
      console.error("Error fetching swap request:", fetchError)
      return { success: false, error: fetchError.message }
    }

    if (swapRequest.owner_id !== userId) {
      return { success: false, error: "You don't have permission to update this swap request" }
    }

    // Update the swap request status
    const { error } = await supabase
      .from("swap_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", swapRequestId)

    if (error) {
      console.error("Error updating swap request status:", error)
      return { success: false, error: error.message }
    }

    // If accepted, update the status of both books
    if (status === "accepted") {
      // Update the requested book status
      const { error: requestedBookError } = await supabase
        .from("books")
        .update({
          status: "swapped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", swapRequest.requested_book_id)

      if (requestedBookError) {
        console.error("Error updating requested book status:", requestedBookError)
      }

      // Update the offered book status
      const { error: offeredBookError } = await supabase
        .from("books")
        .update({
          status: "swapped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", swapRequest.offered_book_id)

      if (offeredBookError) {
        console.error("Error updating offered book status:", offeredBookError)
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/books/${swapRequest.requested_book_id}`)
    revalidatePath(`/books/${swapRequest.offered_book_id}`)
    revalidatePath("/dashboard/swap-requests")

    return { success: true }
  } catch (error: any) {
    console.error("Exception updating swap request status:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
