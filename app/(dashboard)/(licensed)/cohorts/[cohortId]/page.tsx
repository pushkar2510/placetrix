// app/(dashboard)/(licensed)/cohorts/[cohortId]/page.tsx
import { redirect, notFound } from "next/navigation"
import { getUserProfile } from "@/lib/supabase/profile"
import { getCohortMembersAction } from "../actions"
import { createClient } from "@/lib/supabase/server"
import { CohortDetailClient } from "./CohortDetailClient"
import type { Cohort } from "../types"

interface Props {
  params: Promise<{ cohortId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { cohortId } = await params
  return { title: `Cohort | PlaceTrix` }
}

export default async function CohortDetailPage(props: {
  params: Promise<{ cohortId: string }>
  searchParams: Promise<{ page?: string; size?: string; search?: string }>
}) {
  const { cohortId } = await props.params
  const searchParams = await props.searchParams
  const page = Math.max(1, parseInt(searchParams.page || "1", 10))
  const size = Math.max(1, parseInt(searchParams.size || "10", 10))
  const search = searchParams.search || ""

  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  if (
    !["institute_primary", "institute_staff", "institute_placement_officer"].includes(
      profile.account_type
    )
  ) {
    redirect("/home")
  }

  const supabase = await createClient()

  // Fetch cohort info
  const { data: cohort } = await (supabase as any)
    .from("cohorts")
    .select("id, institute_id, name, description, created_at, updated_at")
    .eq("id", cohortId)
    .eq("institute_id", profile.institute_id)
    .maybeSingle()

  if (!cohort) notFound()

  const { members, count } = await getCohortMembersAction(cohortId, page, size, search)

  return (
    <CohortDetailClient
      cohort={cohort as Cohort}
      initialMembers={members}
      totalCount={count}
      initialPage={page}
      initialPageSize={size}
      initialSearch={search}
    />
  )
}
