import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { cookies } from "next/headers"
import type { Database } from "./database.types"
import { cookies as nextCookies } from "next/headers"

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Update the createServerSupabaseClient function to be more robust

export function createServerSupabaseClient() {
  const cookieStore = nextCookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
  return supabase
}
