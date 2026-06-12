"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { unstable_cache } from "next/cache"

export const getCachedGlobalProblemsList = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: problems } = await adminSupabase
      .from("coding_problems")
      .select("id, title, difficulty, created_at")
      .order("created_at", { ascending: true })

    return problems || []
  },
  ["global-problems-list-cache-v1"],
  { revalidate: 3600 } // Cache for 1 hour
)

export async function getIdeProblemList(userId: string) {
  // 1. Fetch cached problems (0ms, no database load)
  const problems = await getCachedGlobalProblemsList()
  
  // 2. Fetch live user solved status
  const supabase = (await createServerClient()) as any
  const { data: solvedData } = await supabase
    .from("coding_submissions")
    .select("problem_id")
    .eq("user_id", userId)
    .eq("status", "Accepted")
    
  const solvedSet = new Set(solvedData?.map((s: any) => s.problem_id) || [])
  
  // 3. Merge and return lightweight array
  return problems.map((p: any, idx: number) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    number: idx + 1,
    isSolved: solvedSet.has(p.id)
  }))
}

export async function getProblemDataSPA(problemId: string, userId: string) {
  const supabase = (await createServerClient()) as any

  // Fetch problem
  const { data: problem, error } = await supabase
    .from("coding_problems")
    .select("*")
    .eq("id", problemId)
    .single()

  if (error || !problem) return null

  // Extract test cases
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

  // Fetch submissions
  const { data: submissions } = await supabase
    .from("coding_submissions")
    .select("id, status, language_id, runtime, memory, passed_count, total_count, created_at")
    .eq("problem_id", problemId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch previous/next problem IDs
  const allProblems = await getCachedGlobalProblemsList()
  const currentIndex = allProblems.findIndex((p: any) => p.id === problemId)
  
  let prevProblemId = null
  let nextProblemId = null
  
  if (currentIndex > 0) {
    prevProblemId = allProblems[currentIndex - 1].id
  }
  if (currentIndex >= 0 && currentIndex < allProblems.length - 1) {
    nextProblemId = allProblems[currentIndex + 1].id
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
