import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { ProblemsDirectoryClient } from "./ProblemsDirectoryClient"

export const metadata = {
  title: "LogicLab — Coding Problems",
  description: "Solve coding challenges, practice algorithms, and sharpen your programming skills.",
}

export default async function LogicLabPage() {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const supabase = (await createClient()) as any
  const isAdmin = profile.account_type === "admin" || profile.account_type === "institute"

  // Fetch all problems
  const { data: problems, error } = await supabase
    .from("coding_problems")
    .select("id, title, difficulty, tags, created_at")
    .order("created_at", { ascending: false })

  // Fetch user's submission stats (best status per problem)
  const { data: submissions } = await supabase
    .from("coding_submissions")
    .select("problem_id, status")
    .eq("user_id", profile.id)

  // Build a map: problem_id -> best status
  const solvedMap: Record<string, string> = {}
  for (const sub of submissions ?? []) {
    if (!solvedMap[sub.problem_id] || sub.status === "Accepted") {
      solvedMap[sub.problem_id] = sub.status
    }
  }

  // Count total submissions per problem for acceptance rate
  const { data: allSubmissions } = await supabase
    .from("coding_submissions")
    .select("problem_id, status")

  const statsMap: Record<string, { total: number; accepted: number }> = {}
  for (const sub of allSubmissions ?? []) {
    if (!statsMap[sub.problem_id]) statsMap[sub.problem_id] = { total: 0, accepted: 0 }
    statsMap[sub.problem_id].total++
    if (sub.status === "Accepted") statsMap[sub.problem_id].accepted++
  }

  const enrichedProblems = (problems ?? []).map((p: any) => ({
    ...p,
    solved_status: solvedMap[p.id] || null,
    acceptance_rate: statsMap[p.id]
      ? Math.round((statsMap[p.id].accepted / statsMap[p.id].total) * 100)
      : null,
    total_submissions: statsMap[p.id]?.total || 0,
  }))

  return (
    <ProblemsDirectoryClient
      problems={enrichedProblems}
      isAdmin={isAdmin}
    />
  )
}
