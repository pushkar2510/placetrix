"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Clock, Search, Layers, X, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Course } from "./types"

// ─── SVG Covers ──────────────────────────────────────────────────────────────
function CourseCover({ courseId }: { courseId: string }) {
  switch (courseId) {
    case "algo-ds-masterclass":
    case "python-for-everybody":
      return (
        <svg className="w-full h-full object-cover" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#bg-algo)" />
          <defs>
            <linearGradient id="bg-algo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          <g opacity="0.1">
            <path d="M0 20 H320 M0 60 H320 M0 100 H320 M0 140 H320 M40 0 V180 M120 0 V180 M200 0 V180 M280 0 V180" stroke="#818cf8" strokeWidth="0.5" />
          </g>
          <circle cx="160" cy="50" r="10" fill="#6366f1" opacity="0.8" />
          <circle cx="100" cy="100" r="8" fill="#818cf8" opacity="0.8" />
          <circle cx="220" cy="100" r="8" fill="#818cf8" opacity="0.8" />
          <circle cx="60" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
          <circle cx="140" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
          <circle cx="180" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
          <circle cx="260" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
          <path d="M160 60 L100 92 M160 60 L220 92 M100 108 L60 144 M100 108 L140 144 M220 108 L180 144 M220 108 L260 144" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
          <text x="160" y="105" fill="#ffffff" opacity="0.08" fontSize="24" fontWeight="bold" textAnchor="middle" letterSpacing="2">BINARY TREE</text>
        </svg>
      )
    case "nextjs-supabase-dev":
    case "programming-for-everybody":
      return (
        <svg className="w-full h-full object-cover" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#bg-next)" />
          <defs>
            <linearGradient id="bg-next" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <g opacity="0.15">
            <path d="M0 40 L320 140 M0 140 L320 40" stroke="#059669" strokeWidth="0.5" />
            <circle cx="80" cy="40" r="20" stroke="#059669" strokeWidth="0.5" />
            <circle cx="240" cy="140" r="20" stroke="#059669" strokeWidth="0.5" />
          </g>
          <path d="M40 90 L280 90 M160 30 L160 150" stroke="#059669" strokeWidth="1.5" opacity="0.3" />
          <circle cx="160" cy="90" r="25" stroke="#34d399" strokeWidth="1.8" fill="#047857" fillOpacity="0.2" />
          <rect x="75" y="60" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
          <rect x="215" y="60" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
          <rect x="75" y="105" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
          <rect x="215" y="105" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
          <text x="160" y="95" fill="#ffffff" opacity="0.08" fontSize="22" fontWeight="bold" textAnchor="middle" letterSpacing="1">FULL-STACK</text>
        </svg>
      )
    case "behavioral-interviews-soft-skills":
    case "foundations-data-everywhere":
      return (
        <svg className="w-full h-full object-cover" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#bg-inter)" />
          <defs>
            <linearGradient id="bg-inter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
          </defs>
          <g opacity="0.1">
            <circle cx="160" cy="90" r="50" stroke="#d97706" strokeWidth="0.5" />
            <circle cx="160" cy="90" r="70" stroke="#d97706" strokeWidth="0.5" />
          </g>
          <circle cx="120" cy="90" r="22" stroke="#d97706" strokeWidth="1.5" fill="#b45309" opacity="0.2" />
          <circle cx="200" cy="90" r="26" stroke="#f59e0b" strokeWidth="1.5" fill="#d97706" opacity="0.2" />
          <path d="M140 82 Q160 72 180 82" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <path d="M140 98 Q160 108 180 98" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <text x="160" y="95" fill="#ffffff" opacity="0.08" fontSize="24" fontWeight="bold" textAnchor="middle" letterSpacing="2">STAR METHOD</text>
        </svg>
      )
    case "system-design-scale":
    case "google-data-analytics":
    default:
      return (
        <svg className="w-full h-full object-cover" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#bg-sys)" />
          <defs>
            <linearGradient id="bg-sys" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
          </defs>
          <g opacity="0.15">
            <path d="M0 0 L320 180 M0 180 L320 0" stroke="#a855f7" strokeWidth="0.5" />
          </g>
          <rect x="35" y="70" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <rect x="135" y="40" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <rect x="135" y="100" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <rect x="240" y="70" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <path d="M80 88 L135 58 M80 88 L135 118 M180 58 L240 88 M180 118 L240 88" stroke="#d8b4fe" strokeWidth="1.5" opacity="0.4" />
          <text x="160" y="95" fill="#ffffff" opacity="0.08" fontSize="22" fontWeight="bold" textAnchor="middle" letterSpacing="1">DISTRIBUTED</text>
        </svg>
      )
  }
}

// ─── CourseCard Component ───────────────────────────────────────────────────
interface CourseCardProps {
  course: Course
  stats: { total: number; completed: number; percentage: number }
  onSelect: () => void
}

function CourseCard({ course, stats, onSelect }: CourseCardProps) {
  const isCompleted = stats.percentage === 100
  const isInProgress = stats.percentage > 0 && stats.percentage < 100

  return (
    <Card
      onClick={onSelect}
      className="group flex flex-col justify-between overflow-hidden border border-border/60 dark:border-zinc-800 bg-card hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer h-full select-none"
    >
      <div className="flex flex-col h-full">
        {/* Cover Image Area */}
        <div className="aspect-video w-full overflow-hidden bg-muted relative rounded-t-lg">
          <CourseCover courseId={course.id} />

          {/* Top-Right Badge Overlay */}
          {course.badge && (
            <span className="absolute top-2.5 right-2.5 bg-black/85 text-white dark:bg-black/90 dark:border dark:border-zinc-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {course.badge}
            </span>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col flex-1">
          {/* Partner & Logo */}
          <div className="flex items-center gap-1.5 px-4 pt-3.5">
            <div className={cn("h-4 w-4 rounded flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow-xs", course.partner?.logoBg || "bg-indigo-600")}>
              {course.partner?.logo || "C"}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {course.partner?.name || "CS Foundation"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm md:text-[14px] text-foreground px-4 mt-2 mb-1.5 leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Course Type / Level Description */}
          <div className="px-4 text-[11px] text-muted-foreground mb-3 flex items-center gap-1.5">
            <span>{course.type || "Specialization"}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="capitalize">{course.level}</span>
          </div>

          {/* Bottom Progress Area */}
          <div className="mt-auto border-t border-border/40 pt-3 pb-4 px-4">
            {stats.percentage > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-medium">
                    {isCompleted ? "Completed" : "In Progress"}
                  </span>
                  <span className="font-semibold text-foreground">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-1 bg-muted animate-in fade-in-30" />
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">Not started</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function CandidateCourseClient({ initialCourses }: { initialCourses: Course[] }) {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "in-progress" | "completed">("all")
  const [showAll, setShowAll] = useState(false)

  // Load progress from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("placetrix_courses_progress")
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Course[]
          // Merge parsed progress into INITIAL_COURSES template to migrate format/fields
          const merged = initialCourses.map(templateCourse => {
            const savedCourse = parsed.find(c => c.id === templateCourse.id)
            if (!savedCourse) return templateCourse
            return {
              ...templateCourse,
              modules: templateCourse.modules.map(templateMod => {
                const savedMod = savedCourse.modules?.find(m => m.id === templateMod.id)
                if (!savedMod) return templateMod
                return {
                  ...templateMod,
                  lessons: templateMod.lessons.map(templateLesson => {
                    const savedLesson = savedMod.lessons?.find(l => l.id === templateLesson.id)
                    return {
                      ...templateLesson,
                      completed: savedLesson ? savedLesson.completed : templateLesson.completed
                    }
                  })
                }
              })
            }
          })
          setCourses(merged)
          localStorage.setItem("placetrix_courses_progress", JSON.stringify(merged))
        } catch (e) {
          console.error("Failed to parse courses progress:", e)
        }
      }
    }
  }, [initialCourses])

  // Calculate statistics for each course
  const courseStats = useMemo(() => {
    const statsMap: Record<string, { total: number; completed: number; percentage: number }> = {}

    courses.forEach(course => {
      let total = 0
      let completed = 0

      course.modules.forEach(mod => {
        mod.lessons.forEach(l => {
          total++
          if (l.completed) completed++
        })
      })

      statsMap[course.id] = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })

    return statsMap
  }, [courses])

  // Calculate counts for tabs/categories dynamically
  const tabCounts = useMemo(() => {
    const counts = { all: 0, "core-cs": 0, "web-dev": 0, "interview-prep": 0, "system-design": 0 }
    courses.forEach(course => {
      counts.all++
      if (course.category === "Core CS") counts["core-cs"]++
      if (course.category === "Web Development") counts["web-dev"]++
      if (course.category === "Interview Prep") counts["interview-prep"]++
      if (course.category === "System Design") counts["system-design"]++
    })
    return counts
  }, [courses])

  // Map tabs values to friendly UI categories
  const categoriesMap: Record<string, string> = {
    all: "All",
    "core-cs": "Core CS",
    "web-dev": "Web Development",
    "interview-prep": "Interview Prep",
    "system-design": "System Design",
  }

  // Filter courses based on search, selected tab (category), and status
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Category filter based on activeTab
      if (activeTab !== "all") {
        const expectedCategory = categoriesMap[activeTab]
        if (course.category !== expectedCategory) return false
      }

      // Status filter
      if (statusFilter !== "all") {
        const stats = courseStats[course.id]
        if (statusFilter === "in-progress") {
          const isInProgress = stats && stats.percentage > 0 && stats.percentage < 100
          if (!isInProgress) return false
        } else if (statusFilter === "completed") {
          const isCompleted = stats && stats.percentage === 100
          if (!isCompleted) return false
        }
      }

      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchTitle = course.title.toLowerCase().includes(query)
        const matchDesc = course.description.toLowerCase().includes(query)
        return matchTitle || matchDesc
      }

      return true
    })
  }, [courses, activeTab, statusFilter, searchQuery, courseStats])

  // Split list to only show 4 items initially if showAll is false
  const displayedCourses = useMemo(() => {
    if (showAll || searchQuery.trim() !== "" || activeTab !== "all" || statusFilter !== "all") {
      return filteredCourses
    }
    return filteredCourses.slice(0, 4)
  }, [filteredCourses, showAll, searchQuery, activeTab, statusFilter])

  const tabConfig = [
    { value: "all", label: "All", count: tabCounts.all },
    { value: "core-cs", label: "Computer Science", count: tabCounts["core-cs"] },
    { value: "web-dev", label: "Web Development", count: tabCounts["web-dev"] },
    { value: "interview-prep", label: "Interview Prep", count: tabCounts["interview-prep"] },
    { value: "system-design", label: "Data Science", count: tabCounts["system-design"] },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-7xl mx-auto">
      {/* Minimal Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Course Board</h1>
        <p className="text-sm text-muted-foreground">
          Explore {courses.length} courses curated just for You!
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowAll(false) }}>
        <div className="space-y-6">
          {/* Search + Filters Area */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full xl:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 text-xs h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Right side controls: Tabs list & Status Pill sub-filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Tabs List */}
              <div className="overflow-x-auto shrink-0">
                <TabsList className="inline-flex h-9 gap-0.5 rounded-lg bg-muted p-1 w-full sm:w-auto justify-start">
                  {tabConfig.map(({ value, label, count }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="gap-1.5 rounded-md px-3 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {label}
                      {count > 0 && (
                        <span className={cn(
                          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                          activeTab === value
                            ? "bg-foreground text-background"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Status Sub-Filters */}
              <div className="flex gap-1 bg-muted/65 p-0.5 rounded-lg border border-border/40 shrink-0">
                <Button
                  variant={statusFilter === "all" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "text-[10px] h-7 px-2.5 rounded-md transition-all font-medium",
                    statusFilter === "all" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "in-progress" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setStatusFilter("in-progress")}
                  className={cn(
                    "text-[10px] h-7 px-2.5 rounded-md transition-all font-medium",
                    statusFilter === "in-progress" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setStatusFilter("completed")}
                  className={cn(
                    "text-[10px] h-7 px-2.5 rounded-md transition-all font-medium",
                    statusFilter === "completed" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Completed
                </Button>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="space-y-6">
            {displayedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border border-dashed border-border/60 rounded-xl bg-card/50">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">No courses found</p>
                  <p className="text-xs text-muted-foreground">Adjust your filters or search query to find courses</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                {displayedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    stats={courseStats[course.id]}
                    onSelect={() => router.push(`/~/courses/${course.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Show All / Show Less button */}
            {filteredCourses.length > 4 && searchQuery.trim() === "" && activeTab === "all" && statusFilter === "all" && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold px-5 py-2 h-9 rounded-lg border-border hover:bg-muted transition-all"
                >
                  {showAll ? "Show Less" : `Show All (${filteredCourses.length}) Courses`}
                  <ChevronRight className={cn("h-4 w-4 transition-transform", showAll && "rotate-90")} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}