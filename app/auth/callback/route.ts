import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback received:", {
    code: !!code,
    error,
    errorDescription,
    url: requestUrl.toString(),
  })

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin),
    )
  }

  if (!code) {
    console.error("No authorization code provided")
    return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin))
  }

  try {
    const supabase = createServerSupabaseClient()

    console.log("Exchanging code for session...")
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError)
      return NextResponse.redirect(
        new URL(`/login?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin),
      )
    }

    if (!data.session) {
      console.error("No session returned from code exchange")
      return NextResponse.redirect(new URL("/login?error=no_session", requestUrl.origin))
    }

    console.log("Session created successfully:", {
      userId: data.session.user.id,
      email: data.session.user.email,
    })

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.session.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile:", profileError)
    }

    // Create profile if it doesn't exist
    if (!profile) {
      console.log("Creating profile for new user...")
      const { error: createProfileError } = await supabase.from("profiles").insert({
        id: data.session.user.id,
        email: data.session.user.email!,
        full_name: data.session.user.user_metadata?.full_name || null,
        avatar_url: data.session.user.user_metadata?.avatar_url || null,
        username: data.session.user.email?.split("@")[0] || null,
      })

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError)
        // Don't fail the login if profile creation fails
      } else {
        console.log("Profile created successfully")
      }
    }

    // Successful authentication - redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
  } catch (error) {
    console.error("Exception in auth callback:", error)
    return NextResponse.redirect(
      new URL(`/login?error=callback_exception&message=${encodeURIComponent(String(error))}`, requestUrl.origin),
    )
  }
}
