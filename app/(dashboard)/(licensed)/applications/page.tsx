import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { MyApplicationsClient, type MyJobApplication } from "./MyApplicationsClient"

export default async function ApplicationsPage() {
  const profile = await getUserProfile()
  if (!profile) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: apps, error } = await (supabase as any)
    .from("job_applications")
    .select(`
      id,
      status,
      created_at,
      job_postings!inner (
        id,
        title,
        job_type,
        location,
        work_mode
      )
    `)
    .eq("candidate_id", profile.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching my applications:", error)
  }

  const applications: MyJobApplication[] = (apps ?? []).map((row: any) => {
    const jobData = Array.isArray(row.job_postings) ? row.job_postings[0] : row.job_postings

    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      job: {
        id: jobData?.id,
        title: jobData?.title,
        job_type: jobData?.job_type,
        location: jobData?.location,
        work_mode: jobData?.work_mode,
        company_name: "Unknown Company",
      }
    }
  })

  return <MyApplicationsClient applications={applications} />
}