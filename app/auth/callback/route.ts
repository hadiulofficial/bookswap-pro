import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback - Code:", !!code, "Error:", error)

  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const supabase = createServerSupabaseClient()

    try {
      console.log("Exchanging code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.user) {
        console.log("User authenticated:", data.user.id)

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking profile:", profileError)
        }

        if (!profile) {
          console.log("Creating profile for new user...")
          // Create profile for new user
          const { error: createProfileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            username: `user_${Math.floor(Math.random() * 1000000)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (createProfileError) {
            console.error("Error creating profile:", createProfileError)
            // Don't fail the auth process, just log the error
          } else {
            console.log("Profile created successfully")
          }
        }

        console.log("Redirecting to dashboard...")
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?success=true`)
      }
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent("Authentication failed")}`)
    }
  }

  console.log("No code provided, redirecting to login")
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
