"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserProfile as getUser } from "@/lib/supabase/profile"
import { revalidatePath } from "next/cache"

export interface UpsertPlacementInfoInput {
  candidateUuid: string
  companyName: string | null
  ctc: number | null
  offerLetterDate: string | null   // ISO date string "YYYY-MM-DD" or null
  jobRole: string | null
  offerType: "on_campus" | "off_campus" | "internship" | "ppo" | "freelance" | null
  location: string | null
}

export async function upsertPlacementInfo(input: UpsertPlacementInfoInput) {
  const profile = await getUser()
  if (!profile || profile.account_type !== "institute") {
    throw new Error("Unauthorized")
  }

  const supabase = await createClient()

  // Verify the student belongs to this institute
  const { data: student, error: checkErr } = await (supabase as any)
    .from("candidate_profiles")
    .select("profile_id")
    .eq("profile_id", input.candidateUuid)
    .eq("institute_id", profile.id)
    .single()

  if (checkErr || !student) {
    throw new Error("Student not found or does not belong to your institute.")
  }

  const { error } = await (supabase as any)
    .from("pt_mt_info")
    .upsert(
      {
        candidate_uuid: input.candidateUuid,
        company_name: input.companyName || null,
        ctc: input.ctc ?? null,
        offer_letter_date: input.offerLetterDate || null,
        job_role: input.jobRole?.trim() || null,
        offer_type: input.offerType || null,
        location: input.location?.trim() || null,
      },
      { onConflict: "candidate_uuid" }
    )

  if (error) {
    console.error("Supabase Error (upsertPlacementInfo):", error)
    throw new Error(error.message)
  }

  revalidatePath("/~/placement-management")
}
