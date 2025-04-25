import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Query to get the check constraint definition
    const { data, error } = await supabase.rpc("get_listing_type_values")

    if (error) {
      console.error("Error fetching listing types:", error)

      // Fallback to common values
      return NextResponse.json({
        values: ["sale", "exchange", "donation"],
        note: "Using fallback values due to error fetching from database",
      })
    }

    return NextResponse.json({ values: data })
  } catch (error) {
    console.error("Exception fetching listing types:", error)
    return NextResponse.json({
      values: ["sale", "exchange", "donation"],
      error: "Error fetching listing types",
    })
  }
}
