import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { buildStorageUrl } from "@/lib/storage"
import { CandidateCourseClient } from "./CandidateCourseClient"
import { AdminCoursesListClient } from "./AdminCoursesListClient"

export const metadata = {
  title: "Courses",
  description: "Placement Skills & Courses",
}

export default async function CoursesPage() {
  const profile = await getUserProfile()
  if (!profile) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // 1. If admin, render the admin dashboard list view
  if (profile.account_type === "admin") {

    const { data: courses, error } = await (supabase as any)
      .from("courses")
      .select(`
        *,
        course_modules(count),
        course_enrollments(count),
        instructor:profiles!courses_instructor_id_fkey(
          display_name,
          avatar_path
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses for admin:", error)
    }

    const formattedCourses = (courses ?? []).map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      type: course.type,
      cover_image_path: course.cover_image_path,
      instructor_name: course.instructor?.display_name || "Instructor",
      instructor_avatar_path: course.instructor?.avatar_path || null,
      is_published: course.is_published,
      created_at: course.created_at,
      modules_count: course.course_modules?.[0]?.count ?? 0,
      enrollments_count: course.course_enrollments?.[0]?.count ?? 0,
    }))

    return <AdminCoursesListClient courses={formattedCourses} />
  }

  // 2. Candidate dashboard view
  // Fetch only published courses
  const { data: dbCourses } = await (supabase as any)
    .from("courses")
    .select(`
      *,
      instructor:profiles!courses_instructor_id_fkey(
        display_name,
        avatar_path
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const { data: dbModules } = await (supabase as any)
    .from("course_modules")
    .select("*")
    .order("order_index", { ascending: true })

  const { data: dbEnrollments } = await (supabase as any)
    .from("course_enrollments")
    .select("*")
    .eq("user_id", profile.id)

  const { data: dbProgress } = await (supabase as any)
    .from("course_module_progress")
    .select("*")
    .eq("user_id", profile.id)

  // Map database structures to Candidate UI structures
  const formattedCandidateCourses = (dbCourses ?? []).map((course: any) => {
    const courseModules = (dbModules ?? [])
      .filter((m: any) => m.course_id === course.id)
      .map((m: any) => {
        const prog = (dbProgress ?? []).find((p: any) => p.module_id === m.id)
        return {
          id: m.id,
          title: m.title,
          description: m.description || "",
          type: m.type as any,
          completed: prog ? prog.completed : false,
          duration: m.duration || "",
        }
      })

    const isEnrolled = (dbEnrollments ?? []).some((e: any) => e.course_id === course.id)

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level as any,
      duration: course.duration,
      type: course.type as any,
      cover_image_path: course.cover_image_path || undefined,
      instructor: {
        name: course.instructor?.display_name || "Instructor",
        role: "Course Instructor",
        avatar: course.instructor?.avatar_path 
          ? buildStorageUrl("avatars", course.instructor.avatar_path) 
          : null,
      },
      modules: courseModules,
      isEnrolled,
    }
  })

  return <CandidateCourseClient initialCourses={formattedCandidateCourses as any} />
}
