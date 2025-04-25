import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { cookies } from "next/headers"
import type { Database } from "./database.types"

// Function for use in server components
export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Enhanced function for server actions
export function createServerSupabaseClient() {
  // Create a direct client with service role for server actions
  // This bypasses the need for cookies and session management
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
