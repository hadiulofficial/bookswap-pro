"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getCategories() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("id, name").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}
