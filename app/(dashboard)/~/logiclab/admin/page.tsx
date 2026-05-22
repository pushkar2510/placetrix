import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { AdminProblemCreatorClient } from "./AdminProblemCreatorClient"

export const metadata = {
  title: "Create Problem — LogicLab Admin",
  description: "Create and manage coding problems for LogicLab.",
}

export default async function AdminPage() {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const isAdmin = profile.account_type === "admin" || profile.account_type === "institute"
  if (!isAdmin) redirect("/~/logiclab")

  return <AdminProblemCreatorClient />
}
