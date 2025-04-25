import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Function for use in server components
export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Enhanced function for server actions
export function createServerSupabaseClient() {
  try {
    const cookieStore = cookies()

    // Log the available cookies for debugging
    console.log(
      "Available cookies:",
      [...cookieStore.getAll()].map((c) => c.name),
    )

    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })

    return supabase
  } catch (error) {
    console.error("Error creating server Supabase client:", error)

    // Fallback to direct client creation if cookie access fails
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
      },
    })
  }
}
