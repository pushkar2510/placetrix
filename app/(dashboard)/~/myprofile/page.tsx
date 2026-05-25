import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { CandidateProfileClient } from "./CandidateProfileClient"
import { InstituteProfileClient } from "./InstituteProfileClient"
import { RecruiterProfileClient } from "./RecruiterProfileClient"

export default async function MyProfilePage() {
  const profile = await getUserProfile()
  if (!profile) return null

  const supabase = await createClient()

  if (profile.account_type === "candidate") {
    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle() // Fix: prevents throwing if 0 rows exist

    return (
      <CandidateProfileClient
        userProfile={profile}
        initialData={candidateProfile ?? null}
      />
    )
  }

  if (profile.account_type === "institute") {
    const { data: instituteProfile } = await supabase
      .from("institute_profiles")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle() // Fix: prevents throwing if 0 rows exist

    return (
      <InstituteProfileClient
        userProfile={profile}
        initialData={instituteProfile ?? null}
      />
    )
  }

  if (profile.account_type === "recruiter") {
    const { data: recruiterProfile } = await supabase
      .from("recruiter_profiles")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle()

    return (
      <RecruiterProfileClient
        userProfile={profile}
        initialData={recruiterProfile ?? null}
      />
    )
  }

  redirect("/~/home")
}
