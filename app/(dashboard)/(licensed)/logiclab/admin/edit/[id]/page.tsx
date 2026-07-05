import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { redirect, notFound } from "next/navigation"
import { AdminProblemEditorClient } from "../../../_components/AdminProblemEditorClient"

export const metadata = {
  title: "Edit Problem — LogicLab Admin",
  description: "Edit coding problems inside the LogicLab Portal.",
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProblemPage({ params }: PageProps) {
  const { id } = await params
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const isAdmin = profile.account_type === "admin"
  if (!isAdmin) redirect("/logiclab")

  const supabase = (await createClient()) as any
  const { data: problem, error } = await (supabase as any)
    .from("logiclab_problems")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !problem) {
    notFound()
  }

  return (
    <AdminProblemEditorClient
      initialProblem={problem}
      isEdit={true}
    />
  )
}
