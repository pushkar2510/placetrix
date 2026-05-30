"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Clock, Search, Layers, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Course } from "./types"

// ─── StatChip Helper ────────────────────────────────────────────────────────
function StatChip({
  icon,
  children,
  tone = "neutral",
}: {
  icon: React.ReactNode
  children: React.ReactNode
  tone?: "neutral" | "sky" | "emerald" | "amber" | "violet" | "rose"
}) {
  const tones = {
    neutral: "border-border/60 bg-muted/50 text-muted-foreground",
    sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    violet: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
  } as const

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tones[tone]
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
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
    <Card className="overflow-hidden border-border/70 bg-card p-0">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-sm md:text-base font-semibold leading-tight text-foreground">
              {course.title}
            </h3>
            
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal bg-muted/40 text-muted-foreground border-border/60">
              {course.level}
            </Badge>

            {isCompleted && (
              <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 text-[11px] px-2 py-0.5">
                Completed
              </Badge>
            )}

            {isInProgress && (
              <Badge className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 text-[11px] px-2 py-0.5">
                In Progress
              </Badge>
            )}
          </div>

          {course.description && (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">
              {course.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <StatChip icon={<Clock className="h-3.5 w-3.5" />}>
              {course.duration}
            </StatChip>
            <StatChip icon={<BookOpen className="h-3.5 w-3.5" />}>
              {course.modules.length} modules
            </StatChip>
            <StatChip icon={<Layers className="h-3.5 w-3.5" />}>
              {course.category}
            </StatChip>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:min-w-[220px] md:items-end md:pt-0 md:border-t-0 md:text-right">
          <div className="flex flex-col gap-1 md:items-end">
            {stats.percentage > 0 ? (
              <>
                <span className="text-xs font-medium text-foreground">
                  {stats.percentage}% Complete
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {stats.completed}/{stats.total} lessons
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">Not started</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSelect}
            className="w-full md:w-auto md:self-end"
          >
            {isCompleted ? "Review Course" : stats.percentage > 0 ? "Continue" : "Start Course"}
          </Button>
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

  // Load progress from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("placetrix_courses_progress")
      if (saved) {
        try {
          setCourses(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse courses progress:", e)
        }
      }
    }
  }, [])

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

  // Calculate counts for tabs
  const tabCounts = useMemo(() => {
    const counts = { all: 0, "in-progress": 0 }
    courses.forEach(course => {
      counts.all++
      const stats = courseStats[course.id]
      if (stats && stats.percentage > 0 && stats.percentage < 100) {
        counts["in-progress"]++
      }
    })
    return counts
  }, [courses, courseStats])

  // Filter courses based on search and selected tab
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Tab filter
      if (activeTab === "in-progress") {
        const stats = courseStats[course.id]
        const isInProgress = stats && stats.percentage > 0 && stats.percentage < 100
        if (!isInProgress) return false
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
  }, [courses, activeTab, searchQuery, courseStats])

  const tabConfig = [
    { value: "all", label: "All", count: tabCounts.all },
    { value: "in-progress", label: "In Progress", count: tabCounts["in-progress"] },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      {/* Minimal Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Courses</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} courses available in your curriculum
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v) }}>
        <div className="space-y-4">
          {/* Search + Tabs List */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
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

            {/* Tabs List */}
            <div className="overflow-x-auto shrink-0 w-full sm:w-auto">
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
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">No courses found</p>
                  <p className="text-xs text-muted-foreground">Adjust your filters or search query to find courses</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    stats={courseStats[course.id]}
                    onSelect={() => router.push(`/~/courses/${course.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
