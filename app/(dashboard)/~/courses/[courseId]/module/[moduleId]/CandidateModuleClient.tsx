"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  ArrowLeft,
  Check,
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Course, Module, Lesson, INITIAL_COURSES } from "../../../types"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLessonIcon(type: Lesson["type"]) {
  switch (type) {
    case "video":
      return <PlayCircle className="h-4 w-4 text-indigo-550 shrink-0" />
    case "article":
      return <FileText className="h-4 w-4 text-emerald-555 shrink-0" />
    case "quiz":
      return <HelpCircle className="h-4 w-4 text-amber-555 shrink-0" />
    case "exercise":
      return <Code className="h-4 w-4 text-rose-555 shrink-0" />
  }
}

function getModuleReadingContent(moduleId: string, moduleTitle: string) {
  switch (moduleId) {
    case "m1":
      return (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Welcome to the <strong>Complexity Analysis & Arrays</strong> module! In computer science, complexity analysis is a way to describe the efficiency of an algorithm in terms of the size of the input. We use <strong>Big-O notation</strong> to establish upper bounds on resource consumption.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">1. Big-O Notation</h3>
          <p>
            Big-O defines the worst-case scenario. For example, accessing an array element by index is an <code>O(1)</code> operation, while searching for an element in an unsorted array of size <code>N</code> takes <code>O(N)</code> time in the worst case.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">2. Space vs Time Complexity</h3>
          <p>
            Often, we can speed up execution time by utilizing extra memory (e.g., using a Hash Map to store previously computed values in <code>O(1)</code> lookup time instead of re-searching, bringing a nested loop from <code>O(N²)</code> to <code>O(N)</code>).
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">3. Two-Pointer Technique</h3>
          <p>
            The two-pointer technique is highly efficient for searching pairs in sorted arrays. By having pointers at both ends of the array and moving them inward based on condition comparisons, we can solve problems in linear time <code>O(N)</code> instead of quadratic <code>O(N²)</code>.
          </p>
        </div>
      )
    case "m2":
      return (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Welcome to <strong>Linked Lists, Stacks & Queues</strong>! Linear data structures store elements sequentially, but their physical memory allocations and access patterns differ.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">1. Linked Lists</h3>
          <p>
            Unlike arrays, linked lists do not store elements in contiguous memory. Instead, each node contains a value and a pointer to the next node. While accessing a node is <code>O(N)</code>, insertions and deletions are <code>O(1)</code> if the node reference is known.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">2. Stacks (LIFO)</h3>
          <p>
            A stack follows the Last-In-First-Out principle. Key operations are <code>push()</code> and <code>pop()</code>, both running in <code>O(1)</code> time. Useful in function call stacks, back-tracking, and undo operations.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">3. Queues (FIFO)</h3>
          <p>
            A queue follows First-In-First-Out. Elements are added at the rear (enqueue) and removed from the front (dequeue). Key for task scheduling, messaging queues, and breadth-first searches.
          </p>
        </div>
      )
    case "n-m1":
      return (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Welcome to <strong>Next.js App Router Foundations</strong>! Next.js introduced the App Router architecture built on React Server Components (RSC) to optimize web app performance out of the box.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">1. React Server Components</h3>
          <p>
            RSCs render on the server by default. They allow direct access to databases, reduce client-side bundle sizes by keeping dependencies server-only, and provide faster initial page loads.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">2. File-Based Routing</h3>
          <p>
            Routes are created by placing a <code>page.tsx</code> file inside folders under the <code>app/</code> directory. Nested folders create nested routes, and bracket folders like <code>[courseId]/</code> create dynamic slug parameters.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">3. Layouts & Data Fetching</h3>
          <p>
            Layouts preserve state across route changes and avoid re-renders. Next.js supports async components, allowing you to fetch data using standard <code>await fetch()</code> inside server pages.
          </p>
        </div>
      )
    default:
      return (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Welcome to the <strong>{moduleTitle}</strong> learning curriculum. This module contains essential core reading materials designed to establish your technical fundamentals in this topic.
          </p>
          <h3 className="text-sm font-semibold text-foreground mt-6 uppercase tracking-wider">Core Syllabus Material</h3>
          <p>
            Read through the course guidelines, explore the listed lessons in the sidebar, and make sure to review related documentation or lecture slides to reinforce your learning.
          </p>
          <p>
            Once you have finished reviewing the materials, use the completion buttons on this page to log your progress.
          </p>
        </div>
      )
  }
}

export function CandidateModuleClient({
  course,
  module,
}: {
  course: Course
  module: Module
}) {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("placetrix_courses_progress")
      if (saved) {
        try {
          setCourses(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse courses progress:", e)
        }
      } else {
        setCourses(INITIAL_COURSES)
      }
    }
  }, [])

  // Resolve current active course and module from state
  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === course.id) || course
  }, [courses, course])

  const currentModule = useMemo(() => {
    return currentCourse.modules.find(m => m.id === module.id) || module
  }, [currentCourse, module])

  const stats = useMemo(() => {
    const total = currentModule.lessons.length
    const completed = currentModule.lessons.filter(l => l.completed).length
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [currentModule])

  const toggleAll = (forceComplete: boolean) => {
    const updated = courses.map(c => {
      if (c.id !== course.id) return c
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== module.id) return m
          return {
            ...m,
            lessons: m.lessons.map(l => ({ ...l, completed: forceComplete }))
          }
        })
      }
    })
    setCourses(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("placetrix_courses_progress", JSON.stringify(updated))
    }
  }

  const isCompleted = stats.percentage === 100

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 animate-in fade-in-50 duration-300">
      
      {/* Navigation Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/~/courses/${course.id}`)}
          className="group gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Course
        </Button>

        <span className="text-xs text-muted-foreground">
          {currentCourse.title}
        </span>
      </div>

      {/* Module Title Section */}
      <div className="flex flex-col gap-2 border-b pb-4 border-border/60">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
            Module
          </Badge>
          {isCompleted && (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/20 text-[9px] px-1.5 py-0 font-normal">
              Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold font-cirka tracking-tight text-foreground">
          {currentModule.title}
        </h1>
        {currentModule.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentModule.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content Reading Panel (Left) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/70 bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Reading Material
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              {getModuleReadingContent(currentModule.id, currentModule.title)}
            </CardContent>
          </Card>

          {/* Single Action Completion Button */}
          <div className="flex items-center pt-2">
            {isCompleted ? (
              <Button
                onClick={() => toggleAll(false)}
                variant="outline"
                className="w-full md:w-auto border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 gap-2 h-10 px-5 font-semibold text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Completed - Mark as Incomplete
              </Button>
            ) : (
              <Button
                onClick={() => toggleAll(true)}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 px-5 font-semibold text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Mark Module as Completed
              </Button>
            )}
          </div>
        </div>

        {/* Module Sidebar Info (Right) */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Module Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-foreground">{stats.percentage}%</span>
              </div>
              <Progress value={stats.percentage} className="h-1.5" />
              
              <div className="pt-3 border-t border-border/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    "font-semibold",
                    isCompleted ? "text-emerald-600 dark:text-emerald-450" : "text-amber-600 dark:text-amber-450"
                  )}>
                    {isCompleted ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Read-Only Checklist Card */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Syllabus Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {currentModule.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 text-xs bg-card"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0",
                          lesson.completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-muted-foreground/30 bg-background text-transparent"
                        )}
                      >
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                      
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getLessonIcon(lesson.type)}
                        <span className={cn(
                          "font-medium text-foreground truncate",
                          lesson.completed && "text-muted-foreground line-through decoration-muted-foreground/45"
                        )}>
                          {lesson.title}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-muted-foreground text-[9px] capitalize px-1 py-0.5 rounded border border-border/30 bg-muted/20 shrink-0">
                      {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
