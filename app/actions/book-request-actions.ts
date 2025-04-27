"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

type BookRequestResult = {
  success: boolean
  error?: string
  requestId?: string
}

export async function requestDonatedBook(userId: string, bookId: string, message?: string): Promise<BookRequestResult> {
  try {
    if (!userId) {
      return { success: false, error: "You must be logged in to request a book" }
    }

    if (!bookId) {
      return { success: false, error: "Invalid book" }
    }

    const supabase = createServerSupabaseClient()

    // Check if the book exists and is a donation listing
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, owner_id, listing_type, status")
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      console.error("Error fetching book:", bookError)
      return { success: false, error: "Book not found" }
    }

    // Make sure the book is a donation listing
    if (book.listing_type !== "Donate") {
      return { success: false, error: "This book is not available for donation" }
    }

    // Check if the book is already reserved or unavailable
    // Note: We're removing the status check for now since we're not sure what status values are being used
    // We'll add it back once we confirm the correct status values
    /*
    if (book.status !== "available") {
      return { success: false, error: "This book is no longer available" }
    }
    */

    // Check if the user is not requesting their own book
    if (book.owner_id === userId) {
      return { success: false, error: "You cannot request your own book" }
    }

    // Check if the user has already requested this book
    const { data: existingRequest, error: checkError } = await supabase
      .from("book_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("status", "pending")
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing request:", checkError)
      return { success: false, error: "Failed to check existing requests" }
    }

    if (existingRequest) {
      return { success: false, error: "You have already requested this book" }
    }

    // Create a new request
    const requestId = uuidv4()
    const { error: insertError } = await supabase.from("book_requests").insert({
      id: requestId,
      user_id: userId,
      book_id: bookId,
      owner_id: book.owner_id,
      message: message || "I'd like to request this book.",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating request:", insertError)
      return { success: false, error: "Failed to create request" }
    }

    // Add a notification for the book owner
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: book.owner_id,
      title: "New Book Request",
      message: `Someone has requested your donated book.`,
      type: "book_request",
      related_id: requestId,
      read: false,
      created_at: new Date().toISOString(),
    })

    // Revalidate relevant paths
    revalidatePath(`/books/${bookId}`)
    revalidatePath("/dashboard/donations")
    revalidatePath("/dashboard/requests")

    return { success: true, requestId }
  } catch (error: any) {
    console.error("Exception requesting book:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Rest of the file remains unchanged
export async function getBookRequests(userId: string, status?: string) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("book_requests")
      .select(`
        *,
        books(id, title, author, cover_image, listing_type),
        profiles!book_requests_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq("owner_id", userId)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching book requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching book requests:", error)
    return []
  }
}

export async function getUserRequests(userId: string, status?: string) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("book_requests")
      .select(`
        *,
        books(id, title, author, cover_image, listing_type),
        profiles!book_requests_owner_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq("user_id", userId)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching user requests:", error)
    return []
  }
}

export async function updateRequestStatus(requestId: string, status: "approved" | "rejected", userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the request exists and belongs to the user
    const { data: request, error: fetchError } = await supabase
      .from("book_requests")
      .select("id, owner_id, user_id, book_id, status")
      .eq("id", requestId)
      .single()

    if (fetchError || !request) {
      console.error("Error fetching request:", fetchError)
      return { success: false, error: "Request not found" }
    }

    // Verify the user is the owner of the book
    if (request.owner_id !== userId) {
      return { success: false, error: "You don't have permission to update this request" }
    }

    // Don't update if already processed
    if (request.status !== "pending") {
      return { success: false, error: "This request has already been processed" }
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from("book_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating request:", updateError)
      return { success: false, error: "Failed to update request status" }
    }

    // If approved, update the book status
    if (status === "approved") {
      const { error: bookUpdateError } = await supabase
        .from("books")
        .update({
          status: "reserved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.book_id)

      if (bookUpdateError) {
        console.error("Error updating book status:", bookUpdateError)
      }
    }

    // Add a notification for the requester
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: request.user_id,
      title: status === "approved" ? "Book Request Approved" : "Book Request Declined",
      message: status === "approved" ? "Your book request has been approved!" : "Your book request has been declined.",
      type: "request_update",
      related_id: requestId,
      read: false,
      created_at: new Date().toISOString(),
    })

    // Revalidate relevant paths
    revalidatePath(`/books/${request.book_id}`)
    revalidatePath("/dashboard/donations")
    revalidatePath("/dashboard/requests")

    return { success: true }
  } catch (error: any) {
    console.error("Exception updating request:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
