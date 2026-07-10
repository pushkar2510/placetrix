// app/(dashboard)/(licensed)/opportunities/types.ts

export type OpportunityStatus = "Draft" | "Published" | "Concluded"
export type OpportunityType = "on_campus" | "off_campus" | "internship" | "ppo" | "freelance"
export type ApplicationStatus = "Applied" | "Shortlisted" | "Interviewing" | "Offered" | "Rejected"

export interface OpportunityTargetingRules {
  courses: string[]        // list of eligible course_ids or names
  passout_years: number[]  // list of eligible years
  min_cgpa: number         // minimum CGPA required (0 for none)
  max_backlogs: number     // maximum backlogs allowed
}

export interface OpportunityListItem {
  id: string
  institute_id: string
  title: string
  company_name: string
  company_logo_url: string | null
  job_role: string
  job_description: string | null
  type: OpportunityType
  location: string | null
  ctc: number | null
  application_link: string | null
  deadline: string // ISO string
  status: OpportunityStatus
  targeting_rules: OpportunityTargetingRules
  created_at: string
  updated_at: string
  created_by: string | null
  // Computed
  applications_count?: number
}

export interface OpportunityApplication {
  id: string
  opportunity_id: string
  candidate_id: string
  resume_url: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
  // Joined from profiles/academic details
  candidate_name?: string
  candidate_email?: string
  candidate_phone?: string | null
  candidate_course?: string | null
  candidate_passout_year?: number | null
  candidate_cgpa?: number | null
  candidate_backlogs?: number | null
}

export interface CandidateOpportunityListItem extends OpportunityListItem {
  my_application_id: string | null
  my_application_status: ApplicationStatus | null
  my_application_resume_url: string | null
}

export interface OpportunityFormData {
  title: string
  company_name: string
  company_logo_url: string | null
  job_role: string
  job_description: string
  type: OpportunityType
  location: string
  ctc: number | null
  application_link: string | null
  deadline: string
  status: OpportunityStatus
  targeting_rules: OpportunityTargetingRules
}
