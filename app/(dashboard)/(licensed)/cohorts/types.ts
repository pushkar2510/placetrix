// app/(dashboard)/(licensed)/cohorts/types.ts

export interface Cohort {
  id: string
  institute_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  student_count?: number
}

export interface CohortMember {
  student_id: string
  full_name: string
  email: string
  avatar_path: string | null
  course_name: string | null
  passout_year: number | null
  account_type: string
}

// Lightweight cohort for dropdowns in events/tests/opportunities editors
export interface CohortOption {
  id: string
  name: string
  student_count: number
}
