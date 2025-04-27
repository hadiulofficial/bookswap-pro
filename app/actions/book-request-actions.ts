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
      .select("id, owner_id, listing_type, status, title")
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

    // Check if the user is not requesting their own book
    if (book.owner_id === userId) {
      return { success: false, error: "You cannot request your own book" }
    }

    // Check if the user has already requested this book
    const { data: existingRequest, error: checkError } = await supabase
      .from("book_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing request:", checkError)
      return { success: false, error: "Failed to check existing requests" }
    }

    if (existingRequest) {
      // If there's an existing request that's been rejected, allow a new request
      if (existingRequest.status === "rejected") {
        // Continue with creating a new request
        console.log("Previous request was rejected, allowing new request")
      } else {
        return {
          success: false,
          error:
            existingRequest.status === "approved"
              ? "Your request for this book has already been approved"
              : "You have already requested this book",
        }
      }
    }

    // Get requester's name for the notification
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", userId)
      .single()

    const requesterName = requesterProfile?.full_name || requesterProfile?.username || "Someone"

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

    // Add a notification for the book owner with more details
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: book.owner_id,
      title: "New Book Request",
      message: `${requesterName} has requested your book "${book.title}". Check your requests to respond.`,
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

export async function getBookRequests(userId: string, status?: string) {
  try {
    if (!userId) {
      console.error("No user ID provided for getBookRequests")
      return []
    }

    console.log("Getting book requests for owner:", userId)
    const supabase = createServerSupabaseClient()

    // First, let's get all book requests for this owner
    const { data: requests, error } = await supabase
      .from("book_requests")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching book requests:", error)
      return []
    }

    if (!requests || requests.length === 0) {
      console.log("No book requests found for owner:", userId)
      return []
    }

    console.log(`Found ${requests.length} book requests for owner ${userId}`)

    // Now, for each request, get the book and requester details
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        // Get book details
        const { data: book } = await supabase
          .from("books")
          .select("id, title, author, cover_image, listing_type")
          .eq("id", request.book_id)
          .single()

        // Get requester details
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", request.user_id)
          .single()

        return {
          ...request,
          books: book || null,
          profiles: profile || null,
        }
      }),
    )

    console.log("Enriched book requests:", enrichedRequests)
    return enrichedRequests
  } catch (error) {
    console.error("Exception fetching book requests:", error)
    return []
  }
}

export async function getUserRequests(userId: string, status?: string) {
  try {
    if (!userId) {
      console.error("No user ID provided for getUserRequests")
      return []
    }

    console.log("Getting user requests for requester:", userId)
    const supabase = createServerSupabaseClient()

    // First, let's get all book requests made by this user
    const { data: requests, error } = await supabase
      .from("book_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user requests:", error)
      return []
    }

    if (!requests || requests.length === 0) {
      console.log("No user requests found for requester:", userId)
      return []
    }

    console.log(`Found ${requests.length} user requests for requester ${userId}`)

    // Now, for each request, get the book and owner details
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        // Get book details
        const { data: book } = await supabase
          .from("books")
          .select("id, title, author, cover_image, listing_type")
          .eq("id", request.book_id)
          .single()

        // Get owner details
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", request.owner_id)
          .single()

        return {
          ...request,
          books: book || null,
          profiles: profile || null,
        }
      }),
    )

    console.log("Enriched user requests:", enrichedRequests)
    return enrichedRequests
  } catch (error) {
    console.error("Exception fetching user requests:", error)
    return []
  }
}

export async function updateRequestStatus(requestId: string, status: "approved" | "rejected", userId: string) {
  try {
    if (!userId || !requestId) {
      return { success: false, error: "Missing required information" }
    }

    console.log(`Updating request ${requestId} to ${status} by user ${userId}`)
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

    // Get book details for notification
    const { data: book } = await supabase.from("books").select("title").eq("id", request.book_id).single()

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

    // Get book title for notification
    const bookTitle = book?.title || "requested book"

    // Add a notification for the requester with more details
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: request.user_id,
      title: status === "approved" ? "Book Request Approved" : "Book Request Declined",
      message:
        status === "approved"
          ? `Your request for "${bookTitle}" has been approved! Contact the owner to arrange pickup.`
          : `Your request for "${bookTitle}" has been declined.`,
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
