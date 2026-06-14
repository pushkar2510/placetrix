import { createClient as createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { DailychallengesPageClient } from "./DailychallengesPageClient"

export const metadata = {
  title: "Daily Challenges History",
  description: "Track your daily challenge progress.",
}

export default async function DailyChallengesPage() {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const supabase = (await createServerClient()) as any

  // Fetch all POTDs
  const { data: historyData, error } = await supabase
    .from("logiclab_daily_challenges")
    .select("id, date, problem_id, logiclab_problems ( id, number, title, difficulty, tags )")
    .order("date", { ascending: false })

  if (error || !historyData) {
    return <div className="p-8 text-center text-rose-500">Failed to load history.</div>
  }

  // Fetch all submissions for these problems by the user from logiclab_daily_challenge_submissions
  const problemIds = historyData.map((h: any) => h.problem_id)
  const { data: submissions } = await supabase
    .from("logiclab_daily_challenge_submissions")
    .select("problem_id, status")
    .eq("user_id", profile.id)
    .in("problem_id", problemIds)

  // Fetch acceptance rates using logiclab_problem_stats view
  const { data: allStats } = await supabase
    .from("logiclab_problem_stats")
    .select("problem_id, total_submissions, accepted_submissions")
    .in("problem_id", problemIds)

  // Build solved map for the user
  const solvedMap: Record<string, string> = {}
  for (const sub of submissions ?? []) {
    if (!solvedMap[sub.problem_id] || sub.status === "Accepted") {
      solvedMap[sub.problem_id] = sub.status
    }
  }

  // Build acceptance stats map
  const statsMap: Record<string, { total: number; accepted: number }> = {}
  for (const stat of allStats ?? []) {
    statsMap[stat.problem_id] = {
      total: Number(stat.total_submissions),
      accepted: Number(stat.accepted_submissions)
    }
  }

  // Enrich history data
  const enrichedHistory = historyData.map((h: any) => {
    const pId = h.problem_id
    const stats = statsMap[pId]
    const accRate = stats && stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0
    return {
      id: h.id,
      date: h.date,
      problem_id: pId,
      number: h.logiclab_problems?.number,
      title: h.logiclab_problems?.title || "Unknown Problem",
      difficulty: h.logiclab_problems?.difficulty || "Medium",
      tags: h.logiclab_problems?.tags || [],
      solved_status: solvedMap[pId] || null,
      total_submissions: stats?.total || 0,
      acceptance_rate: accRate,
    }
  })

  // Calculate overall POTD stats
  const totalPotds = enrichedHistory.length
  const solvedPotds = enrichedHistory.filter((h: any) => h.solved_status === "Accepted").length

  const istOffset = 5.5 * 60 * 60 * 1000
  const today = new Date()
  const istDate = new Date(today.getTime() + istOffset)
  const todayStr = istDate.toISOString().split("T")[0]
  const currentPotd = enrichedHistory.find((h: any) => h.date === todayStr) || null
  const pastHistory = enrichedHistory.filter((h: any) => h.date !== todayStr)

  return (
    <DailychallengesPageClient
      history={pastHistory}
      currentPotd={currentPotd}
      totalPotds={totalPotds}
      solvedPotds={solvedPotds}
    />
  )
}
