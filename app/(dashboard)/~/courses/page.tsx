import { CandidateCourseClient } from "./CandidateCourseClient"
import { INITIAL_COURSES } from "./types"

export const metadata = {
  title: "Courses",
  description: "Placement Skills & Courses",
}

export default function CoursesPage() {
  return <CandidateCourseClient initialCourses={INITIAL_COURSES} />
}
