import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_noStore as noStore } from "next/cache"

export const dynamic = "force-dynamic"

const supabase = createAdminClient()

export async function GET() {
  noStore();
  try {
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000
    const istDate = new Date(now.getTime() + istOffset)
    const today = istDate.toISOString().split("T")[0]

    // 1. Try to fetch today's POTD directly (O(1) lookup)
    const { data: existingPotd } = await (supabase as any)
      .from("daily_challenges")
      .select("problem_id, coding_problems ( id, title, difficulty )")
      .eq("date", today)
      .single()

    if (existingPotd) {
      return NextResponse.json({ success: true, potd: existingPotd })
    }

    // If it doesn't exist yet, we just return nothing, because the Edge Function handles creation.
    return NextResponse.json({ success: true, potd: null })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
