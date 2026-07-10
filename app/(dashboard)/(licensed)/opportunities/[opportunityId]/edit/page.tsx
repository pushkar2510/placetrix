// app/(dashboard)/(licensed)/opportunities/[opportunityId]/edit/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { OpportunityEditorClient } from "../../OpportunityEditorClient"

interface PageProps {
  params: Promise<{
    opportunityId: string
  }>
}

export default async function EditOpportunityPage(props: PageProps) {
  const { opportunityId } = await props.params
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  // Verify staff/placement officer role
  if (!["institute_primary", "institute_placement_officer", "admin"].includes(profile.account_type)) {
    redirect("/opportunities")
  }

  const instituteId = profile.institute_id
  if (!instituteId) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: No institute associated with your account.
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch opportunity details
  const { data: opp, error: oppErr } = await (supabase as any)
    .from("opportunities")
    .select("*, company:companies(*)")
    .eq("id", opportunityId)
    .eq("institute_id", instituteId)
    .maybeSingle()

  if (oppErr || !opp) {
    return (
      <div className="p-8 text-center text-red-500">
        Opportunity not found.
      </div>
    )
  }

  // Fetch list of saved companies for dropdown selection
  const { data: companies } = await (supabase as any)
    .from("companies")
    .select("*")
    .eq("institute_id", instituteId)
    .order("name")

  return (
    <OpportunityEditorClient 
      opportunity={opp}
      companies={companies || []}
    />
  )
}
