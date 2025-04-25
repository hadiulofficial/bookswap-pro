"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function checkAuthStatus() {
  try {
    const supabase = createServerSupabaseClient()

    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return {
        success: false,
        error: sessionError.message,
        status: "session_error",
      }
    }

    if (!sessionData?.session) {
      return {
        success: false,
        error: "No active session",
        status: "no_session",
      }
    }

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      return {
        success: false,
        error: userError.message,
        status: "user_error",
      }
    }

    if (!user) {
      return {
        success: false,
        error: "No user found",
        status: "no_user",
      }
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .eq("id", user.id)
      .single()

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !profileError && !!profile,
        profile: profileError ? null : profile,
      },
      session: {
        expires_at: sessionData.session.expires_at,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: "exception",
    }
  }
}
