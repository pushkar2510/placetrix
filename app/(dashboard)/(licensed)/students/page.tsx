import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { StudentsListClient, Student } from "./StudentsListClient"

export const metadata = {
  title: "Students | PlaceTrix",
  description: "View and manage students registered in your institution.",
}

interface SearchParams {
  page?: string
  size?: string
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}

export default async function StudentsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const profile = await getUserProfile()
  if (!profile || profile.account_type !== "institute_primary") {
    redirect("/home")
  }

  const params = await props.searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const size = Math.max(1, parseInt(params.size || "10", 10))
  const search = params.search || ""
  const status = params.status || "all"
  const sortBy = params.sortBy || "created"
  const sortOrder = params.sortOrder || "desc"

  const supabase = await createClient()

  let query = (supabase as any)
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      institute_verified,
      avatar_path,
      created_at,
      candidate_academic_details (
        passout_year,
        university_prn,
        course:institute_courses (
          course_name
        )
      )
    `, { count: "exact" })
    .eq("account_type", "institute_candidate")
    .eq("institute_id", profile.institute_id)

  // Status Filter
  if (status === "verified") {
    query = query.eq("institute_verified", true)
  } else if (status === "pending") {
    query = query.or("institute_verified.eq.false,institute_verified.is.null")
  }

  // Search Filter
  if (search.trim()) {
    const s = search.trim()
    
    // First, search candidate_academic_details for matching university_prn
    const { data: matchedAcademics } = await (supabase as any)
      .from("candidate_academic_details")
      .select("profile_id")
      .ilike("university_prn", `%${s}%`)

    const matchedProfileIds = (matchedAcademics || []).map((a: any) => a.profile_id)

    if (matchedProfileIds.length === 0) {
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`)
    } else {
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,id.in.(${matchedProfileIds.join(",")})`)
    }
  }

  // Sorting
  const ascending = sortOrder === "asc"
  switch (sortBy) {
    case "name":
      query = query.order("full_name", { ascending })
      break
    case "course":
      query = query.order("candidate_academic_details(course_id)", { ascending })
      break
    case "passout":
      query = query.order("candidate_academic_details(passout_year)", { ascending })
      break
    case "cgpa":
      query = query.order("full_name", { ascending })
      break
    case "status":
      query = query.order("institute_verified", { ascending })
      break
    case "created":
    default:
      query = query.order("created_at", { ascending })
      break
  }

  // Sliced Pagination Range
  const from = (page - 1) * size
  const to = page * size - 1

  const { data: studentsData, count, error } = await query.range(from, to)

  if (error) {
    console.error("Error fetching students:", error)
  }

  const students: Student[] = (studentsData || []).map((s: any) => {
    const cad = Array.isArray(s.candidate_academic_details)
      ? s.candidate_academic_details[0]
      : s.candidate_academic_details;
    const courseName = Array.isArray(cad?.course)
      ? cad?.course[0]?.course_name
      : cad?.course?.course_name;

    return {
      profile_id: s.id,
      full_name: s.full_name,
      email: s.email,
      course_name: courseName || null,
      passout_year: cad?.passout_year || null,
      university_prn: cad?.university_prn || null,
      institute_verified: s.institute_verified || false,
      cgpa: null,
      profile_image_path: s.avatar_path
        ? supabase.storage.from("avatars").getPublicUrl(s.avatar_path).data.publicUrl
        : null,
      created_at: s.created_at,
    }
  })

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Students</h1>
        <p className="text-sm text-muted-foreground">
          {count || 0} student{count === 1 ? "" : "s"} registered.
        </p>
      </div>
      <StudentsListClient 
        students={students}
        totalCount={count || 0}
        initialPage={page}
        initialPageSize={size}
        initialSearch={search}
        initialStatus={status as "all" | "verified" | "pending"}
        initialSortCol={sortBy as any}
        initialSortDir={sortOrder as any}
      />
    </div>
  )
}

