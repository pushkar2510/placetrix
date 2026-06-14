"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_cache } from "next/cache"
import { Problem } from "./_types"

// Cache LogicLab global problems list for 1 hour
export const getCachedGlobalProblemsList = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient()
    
    const { data: problems } = await adminSupabase
      .from("logiclab_problems")
      .select("id, title, difficulty, created_at")
      .order("created_at", { ascending: true })

    return (problems as any[]) || []
  },
  ["global-problems-list-cache-v1"],
  { revalidate: 3600 }
)

// Fetch light problem array for side list inside IDE
export async function getIdeProblemList(userId: string) {
  const problems = await getCachedGlobalProblemsList()
  
  const supabase = (await createServerClient()) as any
  const { data: solvedData } = await supabase
    .from("logiclab_problem_submissions")
    .select("problem_id")
    .eq("user_id", userId)
    .eq("status", "Accepted")
    
  const solvedSet = new Set(solvedData?.map((s: any) => s.problem_id) || [])
  
  return problems.map((p: any, idx: number) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    number: idx + 1,
    isSolved: solvedSet.has(p.id)
  }))
}

// Fetch single problem details, testcases and past submissions for SPA transition
export async function getProblemDataSPA(problemId: string, userId: string) {
  const supabase = (await createServerClient()) as any

  const { data: problem, error } = await supabase
    .from("logiclab_problems")
    .select("*")
    .eq("id", problemId)
    .single()

  if (error || !problem) return null

  let parsedTestCases: any[] = problem.test_cases || []
  if (typeof parsedTestCases === "string") {
    try {
      parsedTestCases = JSON.parse(parsedTestCases)
    } catch {
      parsedTestCases = []
    }
  }

  const sampleTestCases = parsedTestCases
    .filter((tc: any) => tc.is_sample || tc.isSample)
    .map((tc: any, idx: number) => ({
      id: tc.id || String(idx),
      input: tc.input || "",
      expected_output: tc.expected_output || "",
      explanation: tc.explanation || "",
    }))

  const totalTestCases = parsedTestCases.length

  const { data: submissions } = await supabase
    .from("logiclab_problem_submissions")
    .select("id, status, language_id, runtime, memory, passed_count, total_count, created_at")
    .eq("problem_id", problemId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  const allProblems = await getCachedGlobalProblemsList()
  const currentIndex = allProblems.findIndex((p: any) => p.id === problemId)
  
  let prevProblemId = null
  let nextProblemId = null
  
  if (currentIndex > 0) {
    prevProblemId = (allProblems[currentIndex - 1] as any).id
  }
  if (currentIndex >= 0 && currentIndex < allProblems.length - 1) {
    nextProblemId = (allProblems[currentIndex + 1] as any).id
  }

  return {
    problem,
    sampleTestCases,
    totalTestCases,
    submissions: submissions || [],
    prevProblemId,
    nextProblemId
  }
}

// Cache daily challenge POTD metadata for 1 min
export const getCachedPotd = unstable_cache(
  async (todayStr: string) => {
    const adminSupabase = createAdminClient()
    const { data } = await (adminSupabase as any)
      .from("logiclab_daily_challenges")
      .select("id, problem_id, logiclab_problems ( id, title, difficulty )")
      .eq("date", todayStr)
      .single()
    return data
  },
  ["daily-potd-cache"],
  { revalidate: 60, tags: ["potd"] }
)

// Cache global problems and submission stats for 1 hour
export const getCachedGlobalProblems = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient()
    
    const { data: problems } = await adminSupabase
      .from("logiclab_problems")
      .select("id, number, title, difficulty, tags, created_at")
      .order("number", { ascending: true })

    const { data: stats } = await adminSupabase
      .from("logiclab_problem_stats")
      .select("problem_id, total_submissions, accepted_submissions")

    return { problems: problems || [], stats: stats || [] }
  },
  ["global-problems-stats-cache-v2"],
  { revalidate: 3600 }
)
