"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
    BookOpen,
    Clock,
    Search,
    CheckCircle2,
    Lock,
    Award,
    ArrowLeft,
    Check,
    FileText,
    PlayCircle,
    HelpCircle,
    Code,
    Layers,
    ChevronRight,
    X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Lesson {
    id: string
    title: string
    duration: string
    type: "video" | "article" | "quiz" | "exercise"
    completed: boolean
}

export interface Module {
    id: string
    title: string
    description?: string
    lessons: Lesson[]
}

export interface Course {
    id: string
    title: string
    description: string
    category: "Core CS" | "Web Development" | "Interview Prep" | "System Design"
    level: "Beginner" | "Intermediate" | "Advanced"
    duration: string
    type: "Specialization" | "Professional Certificate" | "Course"
    badge?: string
    partner: {
        name: string
        logo: string
        logoBg: string
    }
    instructor: {
        name: string
        role: string
        avatar: string
    }
    modules: Module[]
}

// ─── Initial Placeholder Data ──────────────────────────────────────────────────

const INITIAL_COURSES: Course[] = [
    {
        id: "algo-ds-masterclass",
        title: "Algorithms & Data Structures Masterclass",
        description: "Master complex algorithms and data structures to ace your technical interviews. Covers trees, graphs, dynamic programming, and system design basics.",
        category: "Core CS",
        level: "Advanced",
        duration: "24h 15m",
        type: "Specialization",
        badge: "Popular",
        partner: {
            name: "CS Foundation",
            logo: "C",
            logoBg: "bg-indigo-600"
        },
        instructor: {
            name: "Dr. Evelyn Vance",
            role: "Ex-Google Staff Engineer",
            avatar: "EV"
        },
        modules: [
            {
                id: "m1",
                title: "Complexity Analysis & Arrays",
                description: "Understand Big-O notation, space-time complexity, and basic memory allocations.",
                lessons: [
                    { id: "l1", title: "Introduction to Big-O Notation", duration: "15 min", type: "video", completed: true },
                    { id: "l2", title: "Space vs Time Complexity Tradeoffs", duration: "25 min", type: "article", completed: true },
                    { id: "l3", title: "Two-Pointer Technique & Sliding Window", duration: "45 min", type: "exercise", completed: false },
                    { id: "l4", title: "Module Quiz: Array Foundations", duration: "20 min", type: "quiz", completed: false }
                ]
            },
            {
                id: "m2",
                title: "Linked Lists, Stacks & Queues",
                description: "Learn pointer manipulation, linear structures, and their applications.",
                lessons: [
                    { id: "l5", title: "Singly and Doubly Linked List Operations", duration: "30 min", type: "video", completed: false },
                    { id: "l6", title: "Design a Min Stack in O(1) Time", duration: "40 min", type: "exercise", completed: false },
                    { id: "l7", title: "Queue Implementations using Stacks", duration: "35 min", type: "exercise", completed: false }
                ]
            },
            {
                id: "m3",
                title: "Trees, BSTs & Tries",
                description: "Master hierarchical data structures and search trees.",
                lessons: [
                    { id: "l8", title: "Binary Tree Traversals (Inorder, Preorder, Postorder)", duration: "35 min", type: "video", completed: false },
                    { id: "l9", title: "Binary Search Tree Validation and Insertion", duration: "40 min", type: "exercise", completed: false },
                    { id: "l10", title: "Trie (Prefix Tree) Implementation", duration: "50 min", type: "exercise", completed: false }
                ]
            }
        ]
    },
    {
        id: "nextjs-supabase-dev",
        title: "Full-Stack Development with Next.js & Supabase",
        description: "Build modern, scalable web applications using Next.js App Router, Tailwind CSS, and Supabase for database and authentication.",
        category: "Web Development",
        level: "Intermediate",
        duration: "18h 30m",
        type: "Professional Certificate",
        badge: "Bestseller",
        partner: {
            name: "Vercel & Supabase Partner",
            logo: "S",
            logoBg: "bg-emerald-600"
        },
        instructor: {
            name: "Marcus Chen",
            role: "Lead Frontend Architect",
            avatar: "MC"
        },
        modules: [
            {
                id: "n-m1",
                title: "Next.js App Router Foundations",
                description: "Understand layouts, nested routing, and Server vs Client Components.",
                lessons: [
                    { id: "n-l1", title: "Understanding React Server Components", duration: "20 min", type: "video", completed: true },
                    { id: "n-l2", title: "File-Based Routing & Dynamic Routes", duration: "18 min", type: "video", completed: true },
                    { id: "n-l3", title: "Shared Layouts and Error Handling", duration: "15 min", type: "article", completed: true },
                    { id: "n-l4", title: "RSC Data Fetching Patterns", duration: "30 min", type: "exercise", completed: false }
                ]
            },
            {
                id: "n-m2",
                title: "Database Schema & Supabase Setup",
                description: "Set up your database, migrations, and Row Level Security (RLS).",
                lessons: [
                    { id: "n-l5", title: "Setting up your Supabase Project", duration: "12 min", type: "video", completed: true },
                    { id: "n-l6", title: "Designing Schema with PostgreSQL", duration: "25 min", type: "article", completed: false }
                ]
            }
        ]
    },
    {
        id: "behavioral-interviews-soft-skills",
        title: "Behavioral Interviewing & Soft Skills for Tech",
        description: "Learn how to structure your answers using the STAR method, answer tricky behavioral questions, and showcase leadership.",
        category: "Interview Prep",
        level: "Beginner",
        duration: "6h 45m",
        type: "Course",
        badge: "Job Skills",
        partner: {
            name: "Placetrix Academy",
            logo: "P",
            logoBg: "bg-amber-600"
        },
        instructor: {
            name: "Sarah Jenkins",
            role: "HR Director at Tech Corp",
            avatar: "SJ"
        },
        modules: [
            {
                id: "b-m1",
                title: "Understanding Behavioral Interviews",
                description: "Why tech companies test behaviors and how rubrics evaluate candidates.",
                lessons: [
                    { id: "b-l1", title: "What Interviewers Look For", duration: "15 min", type: "video", completed: true },
                    { id: "b-l2", title: "Decoding the Leadership Principles", duration: "20 min", type: "article", completed: true },
                    { id: "b-l3", title: "Quiz: Core Professional Competencies", duration: "15 min", type: "quiz", completed: true }
                ]
            },
            {
                id: "b-m2",
                title: "The STAR Method Demystified",
                description: "Situation, Task, Action, and Result formatting for maximum impact.",
                lessons: [
                    { id: "b-l4", title: "Structuring with STAR", duration: "22 min", type: "video", completed: true },
                    { id: "b-l5", title: "Deep Dive into Actions and Quantifiable Results", duration: "18 min", type: "article", completed: true }
                ]
            }
        ]
    },
    {
        id: "system-design-scale",
        title: "System Design at Scale",
        description: "Learn how to design highly scalable, fault-tolerant distributed systems. Covers caching, load balancing, sharding, and real-world system architecture.",
        category: "System Design",
        level: "Advanced",
        duration: "14h 20m",
        type: "Specialization",
        badge: "Bestseller",
        partner: {
            name: "Scale Architect Group",
            logo: "A",
            logoBg: "bg-purple-600"
        },
        instructor: {
            name: "Alex Mercer",
            role: "Principal Infrastructure Architect",
            avatar: "AM"
        },
        modules: [
            {
                id: "s-m1",
                title: "Foundations of Distributed Systems",
                description: "Scale from single servers to global networks.",
                lessons: [
                    { id: "s-l1", title: "Vertical vs Horizontal Scaling", duration: "20 min", type: "video", completed: false },
                    { id: "s-l2", title: "Load Balancers (Nginx, HAProxy, Round Robin)", duration: "30 min", type: "video", completed: false }
                ]
            }
        ]
    },
    // Extra Courses to load when "Show more" is clicked (matching the user's Coursera/Michigan screenshot style)
    {
        id: "google-data-analytics",
        title: "Google Data Analytics Professional Certificate",
        description: "Gain in-demand skills that will prepare you for an entry-level job. Learn how to process and analyze data.",
        category: "System Design",
        level: "Beginner",
        duration: "32h 45m",
        type: "Professional Certificate",
        badge: "Job Skills",
        partner: {
            name: "Google",
            logo: "G",
            logoBg: "bg-red-500"
        },
        instructor: {
            name: "Sarah Jenkins",
            role: "Lead Google Data Analyst",
            avatar: "G"
        },
        modules: [
            {
                id: "g1",
                title: "Introducing Data Analytics",
                description: "Understand the core processes of data analytics.",
                lessons: [
                    { id: "gl1", title: "What is Data Analytics?", duration: "12 min", type: "video", completed: false },
                    { id: "gl2", title: "Making Data-Driven Decisions", duration: "18 min", type: "article", completed: false },
                    { id: "gl3", title: "Quiz: Intro to Data", duration: "15 min", type: "quiz", completed: false }
                ]
            }
        ]
    },
    {
        id: "foundations-data-everywhere",
        title: "Foundations: Data, Data, Everywhere",
        description: "This is the first course in the Google Data Analytics Professional Certificate. You will be introduced to data analytics.",
        category: "System Design",
        level: "Beginner",
        duration: "8h 12m",
        type: "Course",
        badge: "Bestseller",
        partner: {
            name: "Google",
            logo: "G",
            logoBg: "bg-red-500"
        },
        instructor: {
            name: "Marcus Chen",
            role: "Google Course Instructor",
            avatar: "G"
        },
        modules: [
            {
                id: "gd1",
                title: "Data and Decisions Foundations",
                description: "Learn how data is structured and stored.",
                lessons: [
                    { id: "gdl1", title: "The Power of Data", duration: "10 min", type: "video", completed: false },
                    { id: "gdl2", title: "Standard Spreadsheets Operations", duration: "25 min", type: "exercise", completed: false }
                ]
            }
        ]
    },
    {
        id: "python-for-everybody",
        title: "Python for Everybody Specialization",
        description: "Learn to program and analyze data with Python. Develop programs to clean, analyze, and visualize data.",
        category: "Core CS",
        level: "Beginner",
        duration: "10h 15m",
        type: "Specialization",
        badge: "Popular",
        partner: {
            name: "University of Michigan",
            logo: "M",
            logoBg: "bg-blue-600"
        },
        instructor: {
            name: "Dr. Evelyn Vance",
            role: "UMich Adjunct Professor",
            avatar: "UM"
        },
        modules: [
            {
                id: "py1",
                title: "Python Basics",
                description: "Understand variables, types, and mathematical operations.",
                lessons: [
                    { id: "pyl1", title: "Installing Python & Text Editors", duration: "15 min", type: "video", completed: false },
                    { id: "pyl2", title: "Variables, Expressions, and Statements", duration: "20 min", type: "article", completed: false }
                ]
            }
        ]
    },
    {
        id: "programming-for-everybody",
        title: "Programming for Everybody (Getting Started with Python)",
        description: "This course teaches the basics of programming computers using Python, covering fundamental variables and loops.",
        category: "Core CS",
        level: "Beginner",
        duration: "6h 20m",
        type: "Course",
        badge: "Bestseller",
        partner: {
            name: "University of Michigan",
            logo: "M",
            logoBg: "bg-blue-600"
        },
        instructor: {
            name: "Alex Mercer",
            role: "UMich Course Instructor",
            avatar: "UM"
        },
        modules: [
            {
                id: "pye1",
                title: "Getting Started with Code",
                description: "Learn how to write your first Python statements.",
                lessons: [
                    { id: "pyel1", title: "Why Program?", duration: "20 min", type: "video", completed: false },
                    { id: "pyel2", title: "Writing Hello World", duration: "10 min", type: "exercise", completed: false }
                ]
            }
        ]
    }
]

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLessonIcon(type: Lesson["type"]) {
    switch (type) {
        case "video":
            return <PlayCircle className="h-4 w-4 text-indigo-500 shrink-0" />
        case "article":
            return <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
        case "quiz":
            return <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
        case "exercise":
            return <Code className="h-4 w-4 text-rose-500 shrink-0" />
    }
}

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
                        <div className={cn("h-4 w-4 rounded flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow-xs", course.partner.logoBg)}>
                            {course.partner.logo}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium truncate">
                            {course.partner.name}
                        </span>
                    </div>

                    {/* Title (fixed min-height to ensure neat alignments) */}
                    <h3 className="font-semibold text-sm md:text-[14px] text-foreground px-4 mt-2 mb-1.5 leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>

                    {/* Course Type / Level Description */}
                    <div className="px-4 text-[11px] text-muted-foreground mb-3 flex items-center gap-1.5">
                        <span>{course.type}</span>
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
                                <Progress value={stats.percentage} className="h-1 bg-muted" />
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

export function CandidateCourse() {
    const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null)

    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<string>("all")

    // Controls how many items to show in the list initially (4 items vs all 8 items)
    const [showAll, setShowAll] = useState(false)

    // Find currently active course
    const activeCourse = useMemo(() => {
        return courses.find(c => c.id === activeCourseId) || null
    }, [courses, activeCourseId])

    // Toggle completion of a lesson
    const toggleLesson = (courseId: string, moduleId: string, lessonId: string) => {
        setCourses(prevCourses => {
            return prevCourses.map(course => {
                if (course.id !== courseId) return course

                return {
                    ...course,
                    modules: course.modules.map(mod => {
                        if (mod.id !== moduleId) return mod

                        return {
                            ...mod,
                            lessons: mod.lessons.map(lesson => {
                                if (lesson.id !== lessonId) return lesson
                                return { ...lesson, completed: !lesson.completed }
                            })
                        }
                    })
                }
            })
        })
    }

    // Toggle completion for all lessons in a module
    const toggleAllLessonsInModule = (courseId: string, moduleId: string, forceComplete: boolean) => {
        setCourses(prevCourses => {
            return prevCourses.map(course => {
                if (course.id !== courseId) return course

                return {
                    ...course,
                    modules: course.modules.map(mod => {
                        if (mod.id !== moduleId) return mod

                        return {
                            ...mod,
                            lessons: mod.lessons.map(lesson => ({
                                ...lesson,
                                completed: forceComplete
                            }))
                        }
                    })
                }
            })
        })
    }

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

    // Map tabs values to friendly UI categories
    const categoriesMap: Record<string, string> = {
        all: "All",
        "core-cs": "Core CS",
        "web-dev": "Web Development",
        "interview-prep": "Interview Prep",
        "system-design": "System Design",
    }

    // Filter courses based on search and selected tab
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Category filter based on activeTab
            if (activeTab !== "all") {
                const expectedCategory = categoriesMap[activeTab]
                if (course.category !== expectedCategory) return false
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
    }, [courses, activeTab, searchQuery])

    // Split list to only show 4 items initially if showAll is false
    const displayedCourses = useMemo(() => {
        if (showAll || searchQuery.trim() !== "" || activeTab !== "all") {
            return filteredCourses
        }
        return filteredCourses.slice(0, 4)
    }, [filteredCourses, showAll, searchQuery, activeTab])

    // Tab configurations matching user's popular category design
    const tabConfig = [
        { value: "all", label: "All" },
        { value: "core-cs", label: "Computer Science" },
        { value: "web-dev", label: "Web Development" },
        { value: "interview-prep", label: "Interview Prep" },
        { value: "system-design", label: "Data Science" },
    ]

    const handleReset = () => {
        setCourses(INITIAL_COURSES)
    }

    if (activeCourse) {
        const stats = courseStats[activeCourse.id]

        return (
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-7xl mx-auto animate-in fade-in-50 duration-300">

                {/* Navigation Breadcrumb / Back button */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveCourseId(null)}
                        className="group gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Courses
                    </Button>

                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleReset}
                        className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        Reset Progress
                    </Button>
                </div>

                {/* Selected Course Minimal Header */}
                <div className="flex flex-col gap-2 border-b pb-4 border-border/60">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                            {activeCourse.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {activeCourse.level}
                        </Badge>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold font-cirka tracking-tight text-foreground">
                        {activeCourse.title}
                    </h1>

                    <p className="text-sm text-muted-foreground max-w-4xl leading-relaxed">
                        {activeCourse.description}
                    </p>
                </div>

                {/* Course Details Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Modules Accordion (Left & Middle) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Course Syllabus
                            </h2>
                            <span className="text-[10px] text-muted-foreground italic">Click lessons to mark completed</span>
                        </div>

                        <Accordion type="multiple" defaultValue={activeCourse.modules.map(m => m.id)} className="w-full space-y-3">
                            {activeCourse.modules.map((mod, index) => {
                                const modCompleted = mod.lessons.filter(l => l.completed).length
                                const modTotal = mod.lessons.length
                                const isAllCompleted = modCompleted === modTotal

                                return (
                                    <AccordionItem
                                        key={mod.id}
                                        value={mod.id}
                                        className="border border-border/70 bg-card rounded-lg px-4 py-0.5 overflow-hidden transition-all"
                                    >
                                        <AccordionTrigger
                                            className="hover:no-underline py-4 flex-col sm:flex-row items-start sm:items-center gap-2 [&[data-state=open]>svg]:rotate-180"
                                        >
                                            <div className="flex items-start gap-3 w-full text-left">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-0.5 w-full min-w-0 pr-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-semibold text-sm text-foreground leading-tight">
                                                            {mod.title}
                                                        </span>
                                                        {isAllCompleted ? (
                                                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/20 text-[9px] px-1.5 py-0 font-normal">
                                                                Completed
                                                            </Badge>
                                                        ) : modCompleted > 0 ? (
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal text-muted-foreground">
                                                                In Progress
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                    {mod.description && (
                                                        <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                                                            {mod.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0 ml-8 sm:ml-auto pr-2 mt-2 sm:mt-0" onClick={e => e.stopPropagation()}>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {modCompleted}/{modTotal} lessons
                                                </span>

                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => toggleAllLessonsInModule(activeCourse.id, mod.id, !isAllCompleted)}
                                                    className="h-6 text-[10px] px-2 hover:bg-muted text-muted-foreground font-medium"
                                                >
                                                    {isAllCompleted ? "Reset" : "Complete"}
                                                </Button>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pt-2 pb-4 border-t border-border/30">
                                            <div className="space-y-2 mt-2">
                                                {mod.lessons.map(lesson => (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => toggleLesson(activeCourse.id, mod.id, lesson.id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-2.5 rounded-md border text-xs cursor-pointer select-none transition-all",
                                                            lesson.completed
                                                                ? "bg-emerald-50/10 border-emerald-250/20 dark:bg-emerald-950/5 dark:border-emerald-800/10"
                                                                : "bg-muted/10 border-transparent hover:bg-muted/40 hover:border-border/60"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                                                    lesson.completed
                                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                                        : "border-muted-foreground/30 bg-background text-transparent hover:border-indigo-500"
                                                                )}
                                                            >
                                                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                            </div>

                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {getLessonIcon(lesson.type)}
                                                                <span className={cn(
                                                                    "font-medium text-foreground truncate",
                                                                    lesson.completed && "text-muted-foreground line-through decoration-muted-foreground/45"
                                                                )}>
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                                            <span className="text-muted-foreground text-[10px] capitalize border border-border/30 bg-background/50 px-1 py-0.5 rounded">
                                                                {lesson.type}
                                                            </span>
                                                            <span className="text-muted-foreground text-[10px] w-12 text-right">
                                                                {lesson.duration}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>

                    {/* Stats, Certificate & Instructor Sidebar */}
                    <div className="space-y-6">

                        {/* Minimal Progress Card */}
                        <Card className="border-border/70 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Completion</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-semibold text-foreground">{stats.percentage}%</span>
                                </div>
                                <Progress value={stats.percentage} className="h-1.5" />
                                <div className="pt-3 flex flex-col gap-2 border-t border-border/40 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium text-foreground">{activeCourse.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Level</span>
                                        <span className="font-medium text-foreground">{activeCourse.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-medium text-foreground">{activeCourse.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Lessons</span>
                                        <span className="font-medium text-foreground">{stats.total}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certificate Unlock Card */}
                        <Card className="border-border/70 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                    Certificate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {stats.percentage === 100 ? (
                                    <div className="space-y-3">
                                        <div className="p-3 border border-emerald-250/20 bg-emerald-500/5 rounded-lg flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                                                Course completed successfully! Your certificate has been unlocked.
                                            </span>
                                        </div>

                                        <Button size="sm" className="w-full text-xs h-8">
                                            Download Certificate
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-muted/40 border border-border/40 rounded-lg flex items-start gap-2.5">
                                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <span className="text-[11px] text-muted-foreground leading-relaxed">
                                            Complete all curriculum lessons above to unlock the course certificate.
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructor Details Card */}
                        <Card className="border-border/70 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs shrink-0 border border-border/60">
                                        {activeCourse.instructor.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-foreground">
                                            {activeCourse.instructor.name}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground">
                                            {activeCourse.instructor.role}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-7xl mx-auto">

            {/* Search Input on top right & title */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Course Board</h1>
                    <p className="text-sm text-muted-foreground">
                        Explore {courses.length} Courses curated just for you.
                    </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 text-xs h-9 bg-card"
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
            </div>

            {/* Categories Filter Pills matching user's image */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full border-b border-border/30">
                {tabConfig.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => {
                            setActiveTab(value)
                            // Reset show all on tab change so it shows first 4 of that tab
                            setShowAll(false)
                        }}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap",
                            activeTab === value
                                ? "bg-foreground text-background border-foreground dark:bg-white dark:text-black dark:border-white"
                                : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Courses Grid */}
            <div>
                {displayedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border border-dashed border-border/60 rounded-xl bg-muted/10">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">No courses found</p>
                            <p className="text-xs text-muted-foreground">Adjust your search query or select another category</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {displayedCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                stats={courseStats[course.id]}
                                onSelect={() => setActiveCourseId(course.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Show more button at the bottom (matching Coursera image) */}
            {!showAll && searchQuery.trim() === "" && activeTab === "all" && filteredCourses.length > 4 && (
                <div className="flex justify-start mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowAll(true)}
                        className="text-xs font-semibold h-9 border-border/75 bg-card hover:bg-muted"
                    >
                        Show 8 more
                    </Button>
                </div>
            )}

        </div>
    )
}
