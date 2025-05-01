"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNotifications(userId: string, filter?: string, limit?: number) {
  try {
    if (!userId) return { data: null, error: "User ID is required" }

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Apply filter if provided
    if (filter === "unread") {
      query = query.eq("read", false)
    } else if (filter) {
      query = query.eq("type", filter)
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching notifications:", error)
      return { data: null, error: "Failed to fetch notifications" }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Exception fetching notifications:", error)
    return { data: null, error: error.message || "An unexpected error occurred" }
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    if (!userId) return { count: 0, error: "User ID is required" }

    const supabase = createServerSupabaseClient()

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) {
      console.error("Error counting notifications:", error)
      return { count: 0, error: "Failed to count notifications" }
    }

    return { count: count || 0, error: null }
  } catch (error: any) {
    console.error("Exception counting notifications:", error)
    return { count: 0, error: error.message || "An unexpected error occurred" }
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    if (!userId || !notificationId) return { success: false, error: "Missing required information" }

    const supabase = createServerSupabaseClient()

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("id, user_id")
      .eq("id", notificationId)
      .single()

    if (fetchError || !notification) {
      console.error("Error fetching notification:", fetchError)
      return { success: false, error: "Notification not found" }
    }

    if (notification.user_id !== userId) {
      return { success: false, error: "You don't have permission to update this notification" }
    }

    // Update the notification
    const { error: updateError } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    if (updateError) {
      console.error("Error marking notification as read:", updateError)
      return { success: false, error: "Failed to update notification" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/notifications")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Exception updating notification:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    if (!userId) return { success: false, error: "User ID is required" }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return { success: false, error: "Failed to update notifications" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/notifications")
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Exception updating notifications:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
