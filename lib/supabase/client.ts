import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })

  return supabaseClient
}

export const supabase = createClientSupabaseClient()

// Helper function to clear all auth data
export const clearAuthData = () => {
  try {
    // Clear localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes("supabase") || key.includes("auth"))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Clear sessionStorage
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes("supabase") || key.includes("auth"))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))

    console.log("Cleared all auth data from storage")
  } catch (error) {
    console.error("Error clearing auth data:", error)
  }
}
