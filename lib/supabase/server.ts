import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { cookies } from "next/headers"
import type { Database } from "./database.types"
import { cookies as nextCookies } from "next/headers"

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Add the missing export that's being referenced elsewhere
export function createServerSupabaseClient() {
  const cookies = nextCookies()
  return createServerComponentClient<Database>({ cookies })
}
