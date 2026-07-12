// app/(dashboard)/(licensed)/cohorts/page.tsx
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/supabase/profile"
import { getCohortsAction } from "./actions"
import { CohortsClient } from "./CohortsClient"

export const metadata = {
  title: "Cohorts",
  description: "Manage student groups (cohorts) for targeted placement activities.",
}

export default async function CohortsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  if (
    !["institute_primary", "institute_staff", "institute_placement_officer"].includes(
      profile.account_type
    )
  ) {
    redirect("/home")
  }

  const cohorts = await getCohortsAction()

  return <CohortsClient cohorts={cohorts} />
}
