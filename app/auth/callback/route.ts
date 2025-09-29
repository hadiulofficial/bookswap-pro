import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  console.log("Auth callback - Code:", !!code, "Error:", error)

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin),
    )
  }

  if (code) {
    try {
      const supabase = createServerSupabaseClient()

      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin),
        )
      }

      if (data.session && data.user) {
        console.log("Session established for user:", data.user.id)

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking profile:", profileError)
        }

        // Redirect to dashboard with success parameter
        return NextResponse.redirect(new URL("/dashboard?auth=success", requestUrl.origin))
      }
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin),
      )
    }
  }

  // No code provided, redirect to login
  console.log("No code provided in auth callback")
  return NextResponse.redirect(new URL("/login?error=No authentication code provided", requestUrl.origin))
}
