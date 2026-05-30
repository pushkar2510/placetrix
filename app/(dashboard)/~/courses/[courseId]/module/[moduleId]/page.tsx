import { INITIAL_COURSES } from "../../../types"
import { CandidateModuleClient } from "./CandidateModuleClient"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    courseId: string
    moduleId: string
  }>
}

export const metadata = {
  title: "Module Classroom",
  description: "Interactive learning curriculum and tasks",
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { courseId, moduleId } = await params

  const course = INITIAL_COURSES.find(c => c.id === courseId)
  if (!course) notFound()

  const module = course.modules.find(m => m.id === moduleId)
  if (!module) notFound()

  return <CandidateModuleClient course={course} module={module} />
}
