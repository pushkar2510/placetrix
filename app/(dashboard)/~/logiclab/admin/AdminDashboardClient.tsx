"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconCode,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUsers,
  IconActivity,
  IconCircleCheck,
  IconCircleDot,
  IconCircleX,
  IconCheck,
  IconClock,
  IconCpu,
  IconAlertCircle,
  IconX,
  IconAlertTriangle,
  IconBook,
  IconTrendingUp,
  IconLayoutDashboard,
  IconTag,
  IconUpload,
  IconSparkles,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { AdminProblemCreatorClient } from "./AdminProblemCreatorClient"

interface Problem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  created_at: string
  acceptance_rate: number | null
  total_submissions: number
}

interface SubmissionLog {
  id: string
  status: string
  runtime: number | null
  memory: number | null
  passed_count: number | null
  total_count: number | null
  language_id: number
  created_at: string
  problem_title: string
  student_name: string
  student_email: string
}

interface StudentStat {
  user_id: string
  student_name: string
  student_email: string
  solvedCount: number
  attemptCount: number
  solvedDifficultyCounts: {
    Easy: number
    Medium: number
    Hard: number
  }
  solvedTags: Record<string, number>
  recentSubmissions: {
    id: string
    created_at: string
    status: string
    problem_title: string
    difficulty: string
    language_id: number
    passed_count?: number | null
    total_count?: number | null
    failed_test_case_info?: {
      index: number
      input: string
      expected: string
      actual: string
    } | null
  }[]
}

interface TagStat {
  name: string
  problemCount: number
  submissions: number
  accepted: number
  rate: number
  studentsSolved: number
  totalStudents: number
}

interface AnalyticsData {
  totalProblems: number
  totalSubmissions: number
  totalAccepted: number
  uniqueStudents: number
  difficultyCounts: {
    Easy: number
    Medium: number
    Hard: number
  }
  languageCounts: Record<string, number>
  successTimeline: { date: string; total: number; accepted: number }[]
  problemStats: {
    id: string
    title: string
    difficulty: string
    submissions: number
    accepted: number
    rate: number
  }[]
  studentStats?: StudentStat[]
  tagStats?: TagStat[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20",
  Medium: "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15 dark:border-amber-500/20",
  Hard: "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/15 dark:border-rose-500/20",
}

const LANG_NAMES: Record<number, string> = {
  71: "Python",
  63: "JavaScript",
  54: "C++",
  62: "Java",
}

// Helper to render verbose diagnostics for failed test cases
function SubmissionDiagnostics({ sub }: { sub: any }) {
  if (sub.status === "Accepted") return null
  
  let failedInfo = sub.failed_test_case_info
  if (typeof failedInfo === "string") {
    try {
      failedInfo = JSON.parse(failedInfo)
    } catch {
      failedInfo = null
    }
  }
  
  if (!failedInfo) return null

  const isWA = sub.status === "Wrong Answer"
  
  return (
    <div className="mt-1.5 p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 rounded-lg text-xs space-y-2 select-text">
      <div className="flex items-center justify-between">
        <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          Diagnostics: {sub.status}
        </span>
        {sub.passed_count !== null && sub.total_count !== null && (
          <span className="text-[9px] text-muted-foreground/80 font-mono">
            Passed {sub.passed_count}/{sub.total_count} cases
          </span>
        )}
      </div>
      
      <div className="space-y-1.5 text-[10px] font-mono leading-relaxed bg-black/40 p-2.5 border border-border/50 rounded-md text-foreground">
        {failedInfo.index && (
          <div>
            <span className="text-muted-foreground/60 font-semibold font-mono">Failing Test Case:</span>{" "}
            <span className="text-foreground font-bold font-mono">#{failedInfo.index}</span>
          </div>
        )}
        
        {failedInfo.input && failedInfo.input !== "(hidden)" && (
          <div>
            <span className="text-muted-foreground/60 font-semibold block mb-0.5">Input Parameters:</span>{" "}
            <code className="text-foreground/90 bg-muted px-1 rounded block max-h-16 overflow-y-auto whitespace-pre-wrap py-0.5">{failedInfo.input}</code>
          </div>
        )}

        {isWA && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-border/20">
            <div>
              <span className="text-emerald-500/80 font-semibold block mb-0.5">Expected Output:</span>
              <code className="text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-1 rounded block whitespace-pre-wrap max-h-20 overflow-y-auto py-0.5">{failedInfo.expected}</code>
            </div>
            <div>
              <span className="text-rose-500/80 font-semibold block mb-0.5">Actual Received:</span>
              <code className="text-rose-400 bg-rose-950/20 border border-rose-500/10 px-1 rounded block whitespace-pre-wrap max-h-20 overflow-y-auto py-0.5">{failedInfo.actual}</code>
            </div>
          </div>
        )}

        {!isWA && failedInfo.actual && (
          <div className="mt-1.5 pt-1.5 border-t border-border/20">
            <span className="text-rose-500/80 font-semibold block mb-0.5">Error/Output diagnostics:</span>
            <pre className="mt-0.5 p-2 rounded bg-background/50 border border-border/30 text-rose-400 font-mono text-[9px] whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
              {failedInfo.actual}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}


// ── Onboarding Banner shown when DB is empty ──
function OnboardingBanner({
  onImport,
  onSeed,
  isSeeding,
}: {
  onImport: () => void
  onSeed: () => void
  isSeeding: boolean
}) {
  return (
    <div className="bg-card/90 border border-emerald-500/10 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <IconSparkles className="h-6 w-6 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-white mb-1">Your curriculum library is empty</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          10 pre-built challenges are bundled with your project in{" "}
          <code className="text-emerald-400 font-mono text-[11px] bg-background px-1 py-0.5 rounded border border-border">
            problems_import.json
          </code>
          . Click <strong className="text-white">Quick Seed</strong> to load them instantly, or use the manual import flow below.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSeed}
          disabled={isSeeding}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isSeeding ? (
            <>
              <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <IconSparkles className="h-3.5 w-3.5" />
              Quick Seed
            </>
          )}
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-2 text-muted-foreground hover:text-white bg-card border border-border hover:border-border px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <IconUpload className="h-3.5 w-3.5" />
          Manual Import
        </button>
      </div>
    </div>
  )
}

export function AdminDashboardClient({
  problems: initialProblems,
  analytics,
  recentSubmissions: initialRecentSubmissions,
}: {
  problems: Problem[]
  analytics: AnalyticsData
  recentSubmissions: SubmissionLog[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "problems" | "create">("overview")
  const [localProblems, setLocalProblems] = useState<Problem[]>(initialProblems)
  const [recentSubmissions] = useState<SubmissionLog[]>(initialRecentSubmissions)

  const [problemSearch, setProblemSearch] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [studentSearch, setStudentSearch] = useState("")

  const [studentCategoryFilter, setStudentCategoryFilter] = useState<"All" | "Struggling" | "Inactive">("All")
  const [selectedStudent, setSelectedStudent] = useState<StudentStat | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const isEmpty = analytics.totalProblems === 0

  const handleExportRoster = () => {
    const listToExport = filteredStudents
    if (listToExport.length === 0) {
      toast.error("No student records available to export.")
      return
    }

    const headers = [
      "Rank",
      "Student Name",
      "Email",
      "Solved Count",
      "Attempt Count",
      "Accuracy Rate",
      "Status",
    ]

    const csvRows = [headers.join(",")]

    listToExport.forEach((st, idx) => {
      const successRate = st.attemptCount
        ? Math.round((st.solvedCount / st.attemptCount) * 100)
        : 0

      let status = "Inactive"
      if (st.attemptCount > 0) {
        if (st.attemptCount >= 3 && st.solvedCount < st.attemptCount * 0.35) status = "Struggling"
        else status = "Practicing"
      }

      const nameEscaped = `"${st.student_name.replace(/"/g, '""')}"`
      const emailEscaped = `"${st.student_email.replace(/"/g, '""')}"`

      csvRows.push([
        idx + 1,
        nameEscaped,
        emailEscaped,
        st.solvedCount,
        st.attemptCount,
        `${successRate}%`,
        status,
      ].join(","))
    })

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    const filename = `logiclab_student_roster_${studentCategoryFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Successfully exported ${listToExport.length} students to CSV!`)
  }

  const handleQuickSeed = useCallback(async () => {
    setIsSeeding(true)
    const tId = toast.loading("Loading problems_import.json...")
    try {
      // Fetch the bundled JSON file from the server
      const fileRes = await fetch("/problems_import.json")
      if (!fileRes.ok) throw new Error("Could not fetch problems_import.json from server")
      const problems = await fileRes.json()

      toast.loading(`Seeding ${problems.length} problems into database...`, { id: tId })

      const seedRes = await fetch("/api/logiclab/seed-problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problems),
      })
      const result = await seedRes.json()

      if (!seedRes.ok) throw new Error(result.error || "Seed failed")

      toast.success(
        `Seeded ${result.inserted} problems! ${result.skipped > 0 ? `(${result.skipped} already existed)` : ""}`,
        { id: tId }
      )
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to seed problems", { id: tId })
    } finally {
      setIsSeeding(false)
    }
  }, [router])

  const handleConfirmDelete = async () => {
    if (!deletingProblemId) return
    setIsDeleting(true)
    const tId = toast.loading("Permanently deleting problem and submissions...")
    try {
      const supabase = createClient()
      const { error: subError } = await supabase
        .from("coding_submissions" as any)
        .delete()
        .eq("problem_id", deletingProblemId)
      if (subError) throw new Error(subError.message)

      const { error: probError } = await supabase
        .from("coding_problems" as any)
        .delete()
        .eq("id", deletingProblemId)
      if (probError) throw new Error(probError.message)

      toast.success("Problem deleted successfully!", { id: tId })
      setLocalProblems((prev) => prev.filter((p) => p.id !== deletingProblemId))
      setDeletingProblemId(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete problem.", { id: tId })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProblems = localProblems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(problemSearch.toLowerCase()))
    const matchesDifficulty = difficultyFilter === "All" || p.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  const filteredStudents = (analytics.studentStats || []).filter((s) => {
    const term = studentSearch.toLowerCase()
    const matchesSearch = s.student_name.toLowerCase().includes(term) || s.student_email.toLowerCase().includes(term)
    if (!matchesSearch) return false

    if (studentCategoryFilter === "Struggling") {
      return s.attemptCount >= 3 && s.solvedCount < s.attemptCount * 0.35
    }
    if (studentCategoryFilter === "Inactive") {
      return s.attemptCount === 0
    }
    return true
  })

  // Sliced version for pagination
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1

  const totalSubmissions = analytics.totalSubmissions || 1
  const acceptanceRate = ((analytics.totalAccepted / totalSubmissions) * 100).toFixed(1)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-[calc(100svh-56px)] bg-background text-foreground">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <IconLayoutDashboard className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white">LogicLab Admin Center</h1>
            <p className="text-xs text-muted-foreground/70">
              Manage challenges, track performance, and import curriculum.
            </p>
          </div>
        </div>
          <div className="flex items-center gap-2 bg-card/60 p-0.5 border border-border rounded-lg shrink-0 select-none">
          {(["overview", "analytics", "problems", "create"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                  : "text-muted-foreground hover:text-foreground dark:hover:text-white"
              }`}
            >
              {tab === "create" ? "Create / Import" : tab === "problems" ? "Manage Problems" : tab === "analytics" ? "Concept Analytics" : "Overview"}
            </button>
          ))}
        </div>
      </div>
      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">

          {/* Onboarding banner — shown only when library is empty */}
          {isEmpty && (
            <OnboardingBanner
              onImport={() => setActiveTab("create")}
              onSeed={handleQuickSeed}
              isSeeding={isSeeding}
            />
          )}

          {/* ── 2-Column Dashboard Overview ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (2/3 width): Leaderboard & Concept Tags */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Student Leaderboard Card */}
              <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col min-h-[420px] shadow-sm">
                <div className="flex flex-col gap-2 mb-4 select-none">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Student Insights & Leaderboard
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
                      {filteredStudents.length} Candidates
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                    View active student statuses, solve counts, and performance metrics.
                  </p>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-1">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                      <input
                        type="text"
                        placeholder="Search by student name or email..."
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full bg-background border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-border transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportRoster}
                        title="Export current roster view to CSV"
                        className="flex items-center gap-1.5 bg-card hover:bg-muted text-foreground/80 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:border-border/80 transition-all cursor-pointer shrink-0"
                      >
                        <IconUpload className="h-3.5 w-3.5 rotate-180 text-emerald-500" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-navigation Tabs for Focus Groups */}
                  <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none select-none border-b border-border/40 font-sans">
                    {(["All", "Struggling", "Inactive"] as const).map((cat) => {
                      let badgeClass = "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/40"
                      if (studentCategoryFilter === cat) {
                        if (cat === "Struggling") badgeClass = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold border-rose-500/50"
                        else if (cat === "Inactive") badgeClass = "bg-zinc-500/10 border-zinc-500/30 text-zinc-600 dark:text-zinc-400 font-bold"
                        else badgeClass = "bg-emerald-500 border-emerald-500 text-black font-bold shadow-md shadow-emerald-500/10"
                      }
                      
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setStudentCategoryFilter(cat)
                            setCurrentPage(1)
                          }}
                          className={`px-3 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${badgeClass}`}
                        >
                          {cat === "Struggling" ? "Struggling candidates" : cat === "Inactive" ? "Inactive candidates" : "All candidates"}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex-1 border border-border/50 rounded-lg overflow-x-auto bg-background/25">
                  <table className="w-full text-left border-collapse text-xs select-none min-w-[600px]">
                    <thead>
                      <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="px-4 py-2.5 text-center w-12">Rank</th>
                        <th className="px-4 py-2.5">Student Details</th>
                        <th className="px-4 py-2.5 text-center w-24">Solved</th>
                        <th className="px-4 py-2.5 text-center w-24">Attempts</th>
                        <th className="px-4 py-2.5 text-center w-24">Accuracy</th>
                        <th className="px-4 py-2.5 text-center w-36">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((st, idx) => {
                          const rank = (currentPage - 1) * itemsPerPage + idx + 1
                          const successRate = st.attemptCount
                            ? Math.round((st.solvedCount / st.attemptCount) * 100)
                            : 0
                          
                          let statusLabel = "Practicing"
                          let statusStyle = "text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20"
                          if (st.attemptCount === 0) {
                            statusLabel = "Inactive"
                            statusStyle = "text-zinc-500 bg-zinc-500/5 border border-zinc-500/20"
                          } else if (st.attemptCount >= 3 && st.solvedCount < st.attemptCount * 0.35) {
                            statusLabel = "Struggling"
                            statusStyle = "text-rose-600 dark:text-rose-400 bg-rose-500/5 border border-rose-500/20 animate-pulse font-bold"
                          }

                          return (
                            <tr
                              key={st.user_id}
                              onClick={() => setSelectedStudent(st)}
                              className="hover:bg-muted/40 transition-colors cursor-pointer group"
                              title="Click to view candidate deep-dive profile"
                            >
                              <td className="px-4 py-3 text-center font-mono text-muted-foreground/50 text-[10px]">
                                {rank}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-foreground/90 group-hover:text-emerald-400 transition-colors">{st.student_name}</div>
                                <div className="text-[10px] text-muted-foreground/75 mt-0.5">{st.student_email}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                  {st.solvedCount}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-mono text-muted-foreground text-[11px]">
                                {st.attemptCount}
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                                {successRate}%
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                                  {statusLabel}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                              <IconUsers className="h-6 w-6 stroke-[1.5]" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {analytics.totalSubmissions === 0
                                  ? "No student submissions recorded"
                                  : "No matches found for search query"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredStudents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
                    <div className="text-muted-foreground font-medium text-[11px]">
                      Showing <span className="text-foreground font-bold">{Math.min(filteredStudents.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
                      <span className="text-foreground font-bold">
                        {Math.min(filteredStudents.length, currentPage * itemsPerPage)}
                      </span>{" "}
                      of <span className="text-foreground font-bold">{filteredStudents.length}</span> students
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Page Size Selector */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted-foreground font-medium">Rows per page:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                          className="bg-background border border-border hover:border-border/80 rounded px-2 py-1 text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer"
                        >
                          {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pagination buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-40 disabled:hover:bg-background transition-colors text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                          title="Previous Page"
                        >
                          <IconChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-muted-foreground text-[11px] px-2 font-medium">
                          Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
                          <span className="text-foreground font-bold">{totalPages}</span>
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-40 disabled:hover:bg-background transition-colors text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                          title="Next Page"
                        >
                          <IconChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (1/3 width): Feed & Language Distribution */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Live Activity Feed */}
              <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col min-h-[350px] shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-4 select-none">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      Live Submission Feed
                    </h3>
                    <p className="text-[10px] text-muted-foreground/50 leading-relaxed font-medium">
                      Real-time submissions log of all active students.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 shrink-0">
                    {acceptanceRate}% success
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto border border-border/50 rounded-lg p-2 bg-background/25 space-y-2 max-h-[350px]">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((log) => (
                      <div
                        key={log.id}
                        className="bg-muted/40 border border-border/50 rounded-lg p-2.5 flex items-start justify-between text-xs hover:border-border/80 hover:bg-muted/60 transition-colors gap-2"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-foreground/90 truncate max-w-[120px]">{log.student_name}</span>
                            <span className="text-[9px] text-muted-foreground/50 shrink-0">
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/75 truncate max-w-[200px]">
                            <span className="font-bold text-foreground/85">"{log.problem_title}"</span>
                            {" · "}
                            <span className="font-mono text-muted-foreground/50">{LANG_NAMES[log.language_id] || "Unknown"}</span>
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            log.status === "Accepted"
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20"
                              : "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/15 dark:border-rose-500/20"
                          }`}
                        >
                          {log.status === "Accepted" ? "AC" : log.status === "Wrong Answer" ? "WA" : log.status?.slice(0, 4) || "?"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground/30">
                      <IconActivity className="h-7 w-7 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        No submissions captured
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col min-h-[250px] shadow-sm">
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Language Popularity
                  </h3>
                  <p className="text-[10px] text-muted-foreground/50">Total compile executions grouped by language.</p>
                </div>
                <div className="space-y-3.5 my-auto">
                  {[
                    { id: 71, label: "Python", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
                    { id: 63, label: "JavaScript", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
                    { id: 54, label: "C++", color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
                    { id: 62, label: "Java", color: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
                  ].map((lang) => {
                    const count = analytics.languageCounts[lang.id] || 0
                    const pct = analytics.totalSubmissions ? (count / analytics.totalSubmissions) * 100 : 0
                    return (
                      <div key={lang.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                            <span className={`h-2 w-2 rounded-full ${lang.color}`} />
                            {lang.label}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${count ? lang.text : "text-muted-foreground/30"}`}>
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-1 bg-card border border-border/55 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${lang.color} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {analytics.totalSubmissions === 0 && (
                    <p className="text-[10px] text-muted-foreground/30 text-center pt-2 font-medium uppercase tracking-widest">
                      No languages logged
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

          {/* ── CONCEPT ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="bg-card border border-border/60 rounded-xl p-6 flex flex-col min-h-[500px] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 select-none border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Curriculum Concept Tag Analytics
                    </h3>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                      Detailed tags aggregated from challenge library, student progress profiles, and tag solve efficiency rates.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 dark:border-amber-500/30 shrink-0 self-start md:self-auto">
                    {analytics.totalProblems} Challenges · {(analytics.tagStats || []).length} Concept Topics
                  </span>
                </div>

                {analytics.tagStats && analytics.tagStats.length > 0 ? (
                  <div className="flex-1 overflow-x-auto border border-border/50 rounded-lg bg-background/25">
                    <table className="w-full text-left border-collapse text-xs select-none min-w-[600px]">
                      <thead>
                        <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="px-5 py-3">Concept Tag Name</th>
                          <th className="px-5 py-3 text-center w-36">Total Challenges</th>
                          <th className="px-5 py-3 w-72">Student Proficiency Completion</th>
                          <th className="px-5 py-3 text-right w-36">Average Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-xs">
                        {analytics.tagStats.map((tag) => {
                          let rateText = "text-muted-foreground/75"
                          if (tag.submissions > 0) {
                            if (tag.rate >= 70) { rateText = "text-emerald-600 dark:text-emerald-400 font-bold" }
                            else if (tag.rate >= 40) { rateText = "text-amber-600 dark:text-amber-400 font-bold" }
                            else { rateText = "text-rose-600 dark:text-rose-400 font-bold" }
                          }

                          const totalStu = tag.totalStudents || 0
                          const solvedStu = tag.studentsSolved || 0
                          const stuPct = totalStu > 0 ? Math.round((solvedStu / totalStu) * 100) : 0
                          let stuBarColor = "bg-zinc-600"
                          if (stuPct >= 70) stuBarColor = "bg-emerald-500"
                          else if (stuPct >= 40) stuBarColor = "bg-amber-500"
                          else if (stuPct > 0) stuBarColor = "bg-rose-500"

                          return (
                            <tr key={tag.name} className="hover:bg-muted/40 transition-colors">
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs bg-background border border-border text-foreground/75 font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                                  {tag.name}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center font-mono font-bold text-foreground/90 text-sm">
                                {tag.problemCount}
                              </td>
                              <td className="px-5 py-4">
                                {totalStu > 0 ? (
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-card border border-border/50 rounded-full overflow-hidden min-w-[120px]">
                                      <div
                                        className={`h-full ${stuBarColor} rounded-full transition-all duration-500`}
                                        style={{ width: `${stuPct}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground shrink-0 font-bold">
                                      {solvedStu}
                                      <span className="text-muted-foreground/50">/{totalStu}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground/30 font-medium">0</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {tag.submissions > 0 ? (
                                  <span className={`font-mono font-bold text-sm ${rateText}`}>
                                    {tag.rate}%
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/30 font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground/30 border border-border/50 rounded-lg py-20 bg-background/10">
                    <IconTag className="h-10 w-10 stroke-[1.2]" />
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1 text-muted-foreground/40">No Concept Tags Configured</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* ── MANAGE PROBLEMS TAB ── */}
      {activeTab === "problems" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search challenges or tags..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="w-full bg-muted border border-input rounded-lg pl-9 pr-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-muted border border-input rounded-lg px-3 py-2 text-xs font-semibold text-foreground/75 focus:outline-none cursor-pointer"
              >
                <option value="All">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <IconPlus className="h-3.5 w-3.5" /> Add Problem
              </button>
            </div>
          </div>

          <div className="bg-card/70 border border-border/60 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/70 border-b border-border text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest select-none">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Challenge Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Acceptance</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredProblems.length > 0 ? (
              <div className="divide-y divide-border/50">
                {filteredProblems.map((problem, idx) => (
                  <div
                    key={problem.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-card/30 transition-colors text-xs"
                  >
                    <div className="col-span-1 text-muted-foreground/50 font-mono text-[10px]">{idx + 1}.</div>
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground/90 truncate">{problem.title}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-foreground/75">
                        {problem.acceptance_rate !== null ? `${problem.acceptance_rate}%` : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 ml-1">({problem.total_submissions})</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Link
                        href={`/~/logiclab/admin/edit/${problem.id}`}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground/70 hover:text-emerald-400 transition-all inline-flex items-center justify-center border border-border/50"
                        title="Edit Problem"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeletingProblemId(problem.id)}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground/70 hover:text-rose-400 transition-all inline-flex items-center justify-center border border-border/50 cursor-pointer"
                        title="Delete Problem"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 select-none">
                <IconCode className="h-8 w-8 text-muted-foreground/15 stroke-[1.5]" />
                <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                  {localProblems.length === 0
                    ? "No challenges in your library yet"
                    : "No challenges matched your search"}
                </p>
                {localProblems.length === 0 && (
                  <button
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-1.5 text-[10px] text-emerald-500 hover:text-emerald-400 font-semibold"
                  >
                    <IconUpload className="h-3 w-3" /> Import or create problems
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CREATE / IMPORT TAB ── */}
      {activeTab === "create" && (
        <div className="animate-in fade-in-50 duration-200">
          <AdminProblemCreatorClient />
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingProblemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3.5 bg-muted/80 border-b border-border">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <IconAlertTriangle className="h-4 w-4" /> Permanent Deletion
              </h3>
              <button
                onClick={() => setDeletingProblemId(null)}
                disabled={isDeleting}
                className="p-1 hover:bg-muted rounded text-muted-foreground/70 hover:text-white transition-colors cursor-pointer"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 text-sm text-foreground/75 space-y-3">
              <p>Are you absolutely sure you want to permanently delete this coding problem?</p>
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs text-rose-400/90 leading-relaxed">
                <strong>WARNING:</strong> This action is irreversible. All student submissions and performance
                records for this challenge will be permanently purged.
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 bg-muted/50 border-t border-border">
              <button
                onClick={() => setDeletingProblemId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-white bg-card border border-border hover:bg-muted transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? (
                  <>
                    <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <IconTrash className="h-3.5 w-3.5" />
                    Delete Problem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Student Profile Detail Modal ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-muted/80 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  Student Detailed Analytics
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                    selectedStudent.attemptCount === 0 ? "text-zinc-600 border-zinc-700 bg-zinc-500/5" :
                    (selectedStudent.attemptCount >= 3 && selectedStudent.solvedCount < selectedStudent.attemptCount * 0.35) ? "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/20" :
                    "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
                  }`}>
                    {selectedStudent.attemptCount === 0 ? "Inactive" :
                     (selectedStudent.attemptCount >= 3 && selectedStudent.solvedCount < selectedStudent.attemptCount * 0.35) ? "Struggling" :
                     "Practicing"}
                  </span>
                </h3>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5 font-mono">
                  Candidate ID: {selectedStudent.user_id.slice(0, 8)}...
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 hover:bg-muted rounded text-muted-foreground/75 hover:text-white transition-colors cursor-pointer"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Profile Card Summary */}
              <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold text-foreground truncate">{selectedStudent.student_name}</h4>
                  <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{selectedStudent.student_email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold block">Overall Accuracy</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight block">
                    {selectedStudent.attemptCount ? Math.round((selectedStudent.solvedCount / selectedStudent.attemptCount) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border/60 rounded-xl p-3 flex flex-col justify-center select-none">
                  <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Solved Challenges</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{selectedStudent.solvedCount}</span>
                </div>
                <div className="bg-card border border-border/60 rounded-xl p-3 flex flex-col justify-center select-none">
                  <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Total Attempts</span>
                  <span className="text-2xl font-black text-foreground mt-1">{selectedStudent.attemptCount}</span>
                </div>
              </div>

              {/* Struggling Alert/Recommendation */}
              {selectedStudent.attemptCount >= 3 && selectedStudent.solvedCount < selectedStudent.attemptCount * 0.35 && (
                <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
                  <IconAlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h6 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Candidate Needs Attention</h6>
                    <p className="text-[11px] text-rose-400/80 leading-relaxed">
                      This student has made a high volume of attempts (<strong className="text-white">{selectedStudent.attemptCount}</strong>) but has a solve rate of only <strong className="text-white">{Math.round((selectedStudent.solvedCount / selectedStudent.attemptCount) * 100)}%</strong>. This mathematically indicates they are stuck on problem sets and need target guidance or conceptual help.
                    </p>
                  </div>
                </div>
              )}

              {/* Difficulty breakdown */}
              <div className="space-y-2 bg-card border border-border/60 rounded-xl p-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Difficulty Breakdown</h5>
                
                {/* Horizontal Segment Bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex border border-border/50">
                  {selectedStudent.solvedDifficultyCounts.Easy > 0 && (
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(selectedStudent.solvedDifficultyCounts.Easy / (selectedStudent.solvedCount || 1)) * 100}%` }}
                      title={`Easy: ${selectedStudent.solvedDifficultyCounts.Easy}`}
                    />
                  )}
                  {selectedStudent.solvedDifficultyCounts.Medium > 0 && (
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${(selectedStudent.solvedDifficultyCounts.Medium / (selectedStudent.solvedCount || 1)) * 100}%` }}
                      title={`Medium: ${selectedStudent.solvedDifficultyCounts.Medium}`}
                    />
                  )}
                  {selectedStudent.solvedDifficultyCounts.Hard > 0 && (
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(selectedStudent.solvedDifficultyCounts.Hard / (selectedStudent.solvedCount || 1)) * 100}%` }}
                      title={`Hard: ${selectedStudent.solvedDifficultyCounts.Hard}`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 text-[9px] font-bold">
                  <div className="space-y-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400">Easy Solved</span>
                    <span className="block text-foreground text-sm font-extrabold">{selectedStudent.solvedDifficultyCounts.Easy}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-amber-600 dark:text-amber-400">Medium Solved</span>
                    <span className="block text-foreground text-sm font-extrabold">{selectedStudent.solvedDifficultyCounts.Medium}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-rose-600 dark:text-rose-400">Hard Solved</span>
                    <span className="block text-foreground text-sm font-extrabold">{selectedStudent.solvedDifficultyCounts.Hard}</span>
                  </div>
                </div>
              </div>

              {/* Solved Concepts Mastery */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skill Mastery Tags</h5>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(selectedStudent.solvedTags).length > 0 ? (
                    Object.entries(selectedStudent.solvedTags).map(([tag, count]) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-muted border border-border text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {tag}
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">{count}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px] text-muted-foreground/50 italic">No curriculum tags mastered yet.</p>
                  )}
                </div>
              </div>

              {/* Student's recent submissions log */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Activity Feed & Error Diagnostics</h5>
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {selectedStudent.recentSubmissions.length > 0 ? (
                    selectedStudent.recentSubmissions.map((sub) => (
                      <div key={sub.id} className="flex flex-col gap-1 border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex items-center justify-between text-xs hover:border-border/80 transition-colors gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <h6 className="font-semibold text-foreground truncate">"{sub.problem_title}"</h6>
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                                sub.difficulty === "Easy" ? "text-emerald-600 bg-emerald-500/5 border border-emerald-500/25" :
                                sub.difficulty === "Medium" ? "text-amber-600 bg-amber-500/5 border border-amber-500/25" :
                                "text-rose-600 bg-rose-500/5 border border-rose-500/25"
                              }`}>{sub.difficulty}</span>
                              <span>·</span>
                              <span>{new Date(sub.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                            sub.status === "Accepted"
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
                              : "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/20"
                          }`}>{sub.status === "Accepted" ? "AC" : sub.status?.slice(0, 4) || "?"}</span>
                        </div>
                        {/* Render diagnostic panel if failed */}
                        <SubmissionDiagnostics sub={sub} />
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-muted-foreground/50 italic">No submissions logged yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-5 py-3 bg-muted/50 border-t border-border border-b border-border/10">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-background border border-border hover:bg-muted text-foreground/80 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
