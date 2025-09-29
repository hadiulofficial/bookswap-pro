import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
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
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("Exchanging code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        console.log("Session established successfully")

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking profile:", profileError)
        }

        console.log("Profile exists:", !!profile)

        // Redirect to dashboard with success parameter
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?success=true`)
      }
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent("Authentication failed")}`)
    }
  }

  // No code parameter, redirect to login
  console.log("No code parameter, redirecting to login")
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
