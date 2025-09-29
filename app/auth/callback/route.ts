import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  console.log("Auth callback received:", { code: !!code, next })

  if (code) {
    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
          },
        },
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      console.log("Code exchange result:", {
        success: !!data.session,
        error: error?.message,
        userId: data.session?.user?.id,
      })

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin))
      }

      if (data.session) {
        console.log("Session created successfully, redirecting to:", next)
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(new URL("/login?error=callback_error", requestUrl.origin))
    }
  }

  // If no code or session creation failed, redirect to login
  console.log("No code provided or session creation failed, redirecting to login")
  return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin))
}
