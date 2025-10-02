"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function requestBookSwap(userId: string, bookId: string, offeredBookId: string, message?: string) {
  try {
    console.log("=== REQUEST BOOK SWAP STARTED ===")
    console.log("Requesting book swap:", { userId, bookId, offeredBookId, message })

    if (!userId || !bookId || !offeredBookId) {
      console.error("Missing required fields:", { userId, bookId, offeredBookId })
      return {
        success: false,
        error: "Missing required information",
      }
    }

    const supabase = createServerSupabaseClient()

    // Get the book owner's ID
    console.log("Fetching book details for bookId:", bookId)
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("owner_id, listing_type, title")
      .eq("id", bookId)
      .single()

    if (bookError) {
      console.error("Error fetching book:", bookError)
      return {
        success: false,
        error: "Book not found",
      }
    }

    if (!book) {
      console.error("Book not found in database")
      return {
        success: false,
        error: "Book not found",
      }
    }

    console.log("Book found:", book)

    // Check if user is trying to swap with their own book
    if (book.owner_id === userId) {
      console.error("User trying to swap with their own book")
      return {
        success: false,
        error: "You cannot swap with your own book",
      }
    }

    // Verify the offered book belongs to the user
    console.log("Fetching offered book details for offeredBookId:", offeredBookId)
    const { data: offeredBook, error: offeredBookError } = await supabase
      .from("books")
      .select("owner_id, listing_type, status, title")
      .eq("id", offeredBookId)
      .eq("owner_id", userId)
      .single()

    if (offeredBookError) {
      console.error("Error fetching offered book:", offeredBookError)
      return {
        success: false,
        error: "The book you're offering is not valid",
      }
    }

    if (!offeredBook) {
      console.error("Offered book not found or doesn't belong to user")
      return {
        success: false,
        error: "The book you're offering is not valid",
      }
    }

    console.log("Offered book found:", offeredBook)
    console.log("Offered book listing_type:", offeredBook.listing_type)
    console.log("Offered book status:", offeredBook.status)

    // Check if the offered book is available - CASE INSENSITIVE
    const bookStatus = (offeredBook.status || "").toLowerCase().trim()
    console.log("Normalized book status:", bookStatus)

    if (bookStatus !== "available") {
      console.error("Offered book is not available. Status:", offeredBook.status, "Normalized:", bookStatus)
      return {
        success: false,
        error: `The book you're offering is not available (current status: ${offeredBook.status})`,
      }
    }

    console.log("Offered book status is valid (available)")

    // Check listing type - be more lenient with the check
    const offeredBookListingType = (offeredBook.listing_type || "").toLowerCase().trim()
    console.log("Normalized offered book listing_type:", offeredBookListingType)

    const isExchangeable =
      offeredBookListingType === "exchange" ||
      offeredBookListingType === "swap" ||
      offeredBookListingType.includes("exchange") ||
      offeredBookListingType.includes("swap")

    if (!isExchangeable) {
      console.error("Offered book is not listed for exchange. Listing type:", offeredBook.listing_type)
      return {
        success: false,
        error: `The book you're offering must be listed as 'Exchange' or 'Swap' (current: ${offeredBook.listing_type})`,
      }
    }

    console.log("Offered book listing type is valid (exchange/swap)")

    // Check if a swap request already exists
    console.log("Checking for existing swap requests")
    const { data: existingRequest, error: existingRequestError } = await supabase
      .from("book_swaps")
      .select("id, status")
      .eq("requester_id", userId)
      .eq("requested_book_id", bookId)
      .eq("offered_book_id", offeredBookId)
      .maybeSingle()

    if (existingRequestError) {
      console.error("Error checking for existing requests:", existingRequestError)
    }

    if (existingRequest) {
      console.error("Swap request already exists:", existingRequest)
      return {
        success: false,
        error: "You have already requested to swap this book",
      }
    }

    console.log("No existing swap request found, proceeding with creation")

    // Generate a UUID for the swap request
    const swapId = randomUUID()
    console.log("Generated swap ID:", swapId)

    // Create the swap request with explicit ID
    const swapData = {
      id: swapId,
      requester_id: userId,
      owner_id: book.owner_id,
      requested_book_id: bookId,
      offered_book_id: offeredBookId,
      message: message || null,
      status: "pending" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Creating swap request with data:", swapData)

    const { data: insertedSwap, error: insertError } = await supabase.from("book_swaps").insert(swapData).select("id")

    if (insertError) {
      console.error("Error creating swap request:", insertError)
      console.error("Insert error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })
      return {
        success: false,
        error: `Failed to create swap request: ${insertError.message}`,
      }
    }

    console.log("Swap request created successfully. Inserted data:", insertedSwap)

    // Create a notification for the book owner
    const notificationId = randomUUID()
    const notificationData = {
      id: notificationId,
      user_id: book.owner_id,
      title: "New Swap Request",
      message: `Someone wants to swap "${offeredBook.title}" with your book "${book.title}"`,
      type: "swap_request" as const,
      related_id: swapId,
      read: false,
      created_at: new Date().toISOString(),
    }

    console.log("Creating notification with data:", notificationData)

    const { error: notificationError } = await supabase.from("notifications").insert(notificationData)

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      console.error("Notification error details:", {
        code: notificationError.code,
        message: notificationError.message,
        details: notificationError.details,
      })
      // Don't fail the swap request if notification fails
    } else {
      console.log("Notification created successfully")
    }

    // Revalidate relevant paths
    console.log("Revalidating paths")
    revalidatePath("/dashboard/swaps")
    revalidatePath(`/books/${bookId}`)

    console.log("=== REQUEST BOOK SWAP COMPLETED SUCCESSFULLY ===")
    return {
      success: true,
      swapId: swapId,
    }
  } catch (error: any) {
    console.error("=== EXCEPTION IN REQUEST BOOK SWAP ===")
    console.error("Exception requesting book swap:", error)
    console.error("Error stack:", error.stack)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function updateSwapStatus(swapId: string, status: "approved" | "rejected", userId: string) {
  try {
    if (!swapId || !status || !userId) {
      return {
        success: false,
        error: "Missing required information",
      }
    }

    const supabase = createServerSupabaseClient()

    // Verify the swap request exists and belongs to the user
    const { data: swap, error: swapError } = await supabase
      .from("book_swaps")
      .select("*")
      .eq("id", swapId)
      .eq("owner_id", userId)
      .single()

    if (swapError || !swap) {
      console.error("Error fetching swap request:", swapError)
      return {
        success: false,
        error: "Swap request not found or you don't have permission",
      }
    }

    if (swap.status !== "pending") {
      return {
        success: false,
        error: "This swap request has already been processed",
      }
    }

    // Update the swap request status
    const { error: updateError } = await supabase
      .from("book_swaps")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", swapId)

    if (updateError) {
      console.error("Error updating swap request:", updateError)
      return {
        success: false,
        error: "Failed to update swap request",
      }
    }

    // If approved, update both books' status to "swapped"
    if (status === "approved") {
      // Update requested book status
      await supabase
        .from("books")
        .update({
          status: "swapped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", swap.requested_book_id)

      // Update offered book status
      await supabase
        .from("books")
        .update({
          status: "swapped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", swap.offered_book_id)
    }

    // Create a notification for the requester
    const notificationId = randomUUID()
    await supabase.from("notifications").insert({
      id: notificationId,
      user_id: swap.requester_id,
      title: status === "approved" ? "Swap Request Approved" : "Swap Request Rejected",
      message:
        status === "approved"
          ? "Your swap request has been approved! Contact the owner to arrange the exchange."
          : "Your swap request has been rejected.",
      type: `swap_${status}` as const,
      related_id: swapId,
      read: false,
      created_at: new Date().toISOString(),
    })

    revalidatePath("/dashboard/swaps")
    revalidatePath(`/books/${swap.requested_book_id}`)
    revalidatePath(`/books/${swap.offered_book_id}`)

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Exception updating swap status:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export async function getUserSwappableBooks(userId: string) {
  try {
    if (!userId) {
      return []
    }

    const supabase = createServerSupabaseClient()

    // Get all available books for the user
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching swappable books:", error)
      return []
    }

    // Filter for exchange/swap books on the client side with case-insensitive checks
    const exchangeableBooks = (data || []).filter((book) => {
      const status = (book.status || "").toLowerCase().trim()
      const listingType = (book.listing_type || "").toLowerCase().trim()

      const isAvailable = status === "available"
      const isExchangeable =
        listingType === "exchange" ||
        listingType === "swap" ||
        listingType.includes("exchange") ||
        listingType.includes("swap")

      return isAvailable && isExchangeable
    })

    console.log(`Found ${exchangeableBooks.length} exchangeable books out of ${data?.length || 0} total books`)

    return exchangeableBooks
  } catch (error) {
    console.error("Exception fetching swappable books:", error)
    return []
  }
}
