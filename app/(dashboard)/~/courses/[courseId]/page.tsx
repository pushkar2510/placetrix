import { CandidateCoursesInnerClient } from "./CandidateCoursesInnerClient"
import { INITIAL_COURSES } from "../types"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    courseId: string
  }>
}

export const metadata = {
  title: "Course Curriculum",
  description: "Detailed syllabus and learning path",
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params
  const course = INITIAL_COURSES.find(c => c.id === courseId)

  if (!course) {
    notFound()
  }

  return <CandidateCoursesInnerClient course={course} />
}
