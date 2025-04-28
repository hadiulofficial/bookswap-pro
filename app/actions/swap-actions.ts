"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function requestBookSwap(userId: string, bookId: string, offeredBookId: string, message?: string) {
  try {
    console.log("Requesting book swap:", { userId, bookId, offeredBookId, message })

    if (!userId || !bookId || !offeredBookId) {
      return {
        success: false,
        error: "Missing required information",
      }
    }

    const supabase = createServerSupabaseClient()

    // Get the book owner's ID
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("owner_id, listing_type, status")
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      console.error("Error fetching book:", bookError)
      return {
        success: false,
        error: "Book not found",
      }
    }

    // Check if the book is available
    if (book.status !== "available") {
      return {
        success: false,
        error: "This book is no longer available",
      }
    }

    // Verify the book is listed for exchange - more permissive check
    const bookListingType = (book.listing_type || "").toLowerCase()
    console.log("Book listing type:", bookListingType)

    if (!bookListingType.includes("exchange") && !bookListingType.includes("swap")) {
      return {
        success: false,
        error: "This book is not available for exchange",
      }
    }

    // Verify the offered book belongs to the user and is listed for exchange
    const { data: offeredBook, error: offeredBookError } = await supabase
      .from("books")
      .select("owner_id, listing_type, status")
      .eq("id", offeredBookId)
      .eq("owner_id", userId)
      .single()

    if (offeredBookError || !offeredBook) {
      console.error("Error fetching offered book:", offeredBookError)
      return {
        success: false,
        error: "The book you're offering is not valid",
      }
    }

    // Check if the offered book is available
    if (offeredBook.status !== "available") {
      return {
        success: false,
        error: "The book you're offering is not available for exchange",
      }
    }

    // More permissive check for listing type
    const offeredBookListingType = (offeredBook.listing_type || "").toLowerCase()
    console.log("Offered book listing type:", offeredBookListingType)

    if (!offeredBookListingType.includes("exchange") && !offeredBookListingType.includes("swap")) {
      return {
        success: false,
        error: "The book you're offering is not available for exchange",
      }
    }

    // Check if a swap request already exists
    const { data: existingRequest, error: existingRequestError } = await supabase
      .from("book_swaps")
      .select("id, status")
      .eq("requester_id", userId)
      .eq("requested_book_id", bookId)
      .eq("offered_book_id", offeredBookId)
      .maybeSingle()

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return {
          success: false,
          error: "You have already requested to swap this book",
        }
      } else if (existingRequest.status === "approved") {
        return {
          success: false,
          error: "This swap has already been approved",
        }
      } else if (existingRequest.status === "rejected") {
        // If rejected, allow to request again
        const { error: deleteError } = await supabase.from("book_swaps").delete().eq("id", existingRequest.id)

        if (deleteError) {
          console.error("Error deleting rejected swap request:", deleteError)
        }
      }
    }

    // Create the swap request
    const swapId = uuidv4()
    const { error: insertError } = await supabase.from("book_swaps").insert({
      id: swapId,
      requester_id: userId,
      owner_id: book.owner_id,
      requested_book_id: bookId,
      offered_book_id: offeredBookId,
      message: message || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating swap request:", insertError)
      return {
        success: false,
        error: "Failed to create swap request",
      }
    }

    // Create a notification for the book owner
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: book.owner_id,
      title: "New Swap Request",
      message: `Someone wants to swap one of their books with your book`,
      type: "swap_request",
      related_id: swapId,
      read: false,
      created_at: new Date().toISOString(),
    })

    revalidatePath("/dashboard/swaps")
    revalidatePath(`/books/${bookId}`)

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Exception requesting book swap:", error)
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
    await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: swap.requester_id,
      title: status === "approved" ? "Swap Request Approved" : "Swap Request Rejected",
      message:
        status === "approved"
          ? "Your swap request has been approved! Contact the owner to arrange the exchange."
          : "Your swap request has been rejected.",
      type: "swap_" + status,
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

    // Log all books for debugging
    const { data: allBooks, error: allBooksError } = await supabase
      .from("books")
      .select("id, title, listing_type, status")
      .eq("owner_id", userId)

    console.log("All user books:", allBooks)

    if (allBooksError) {
      console.error("Error fetching all books:", allBooksError)
    }

    // Get all available books first
    const { data: availableBooks, error: availableBooksError } = await supabase
      .from("books")
      .select("*")
      .eq("owner_id", userId)
      .eq("status", "available")
      .order("created_at", { ascending: false })

    if (availableBooksError) {
      console.error("Error fetching available books:", availableBooksError)
      return []
    }

    // Filter for exchange books client-side
    const exchangeBooks =
      availableBooks?.filter((book) => {
        const listingType = (book.listing_type || "").toLowerCase()
        return listingType.includes("exchange") || listingType.includes("swap")
      }) || []

    console.log("Filtered exchange books:", exchangeBooks)

    return exchangeBooks
  } catch (error) {
    console.error("Exception fetching swappable books:", error)
    return []
  }
}
