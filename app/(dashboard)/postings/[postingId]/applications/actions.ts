"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { JobApplicationStatus } from "./_types"

export async function updateApplicationStatusAction(applicationId: string, postingId: string, status: JobApplicationStatus) {
  // Postings was a recruiter-only feature — recruiter role has been removed.
  throw new Error("Unauthorized: Job postings feature has been removed.")
}
