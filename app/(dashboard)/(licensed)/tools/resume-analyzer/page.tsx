import { ResumeAnalyzerClient } from "./ResumeAnalyzerClient"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Resume Analyzer | PlaceTrix",
  description: "AI-powered ATS resume analysis with keyword matching, skill gap identification, and actionable improvements.",
}

export default async function ResumeAnalyzerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { job_id } = await searchParams;
  let prefillDescription = ""

  if (job_id && typeof job_id === "string") {
    const supabase = await createClient()
    // @ts-ignore
    const { data } = await (supabase as any)
      .from("job_postings" as any)
      .select(`
        title, 
        description, 
        requirements,
        skills
      `)
      .eq("id", job_id)
      .single()

    if (data) {
      prefillDescription = `Role: ${data.title}\n\nDescription:\n${data.description}${data.requirements ? `\n\nRequirements:\n${data.requirements}` : ''}${(data.skills && data.skills.length > 0) ? `\n\nSkills: ${data.skills.join(', ')}` : ''}`
    }
  }

  return <ResumeAnalyzerClient initialDescription={prefillDescription} />
}
