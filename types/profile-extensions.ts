export type EducationType = "ssc" | "hsc" | "diploma" | "ug" | "pg" | "other";

export interface CandidateEducation {
  id: string;
  profile_id: string;
  type: EducationType;
  institution_name: string;
  course_or_stream: string | null;
  grade_or_percentage: number;
  passout_year: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateExperience {
  id: string;
  profile_id: string;
  title: string;
  company_name: string;
  location: string | null;
  start_date: string; // ISO format: YYYY-MM-DD
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateProject {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  project_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  associated_with: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateCertification {
  id: string;
  profile_id: string;
  name: string;
  issuing_org: string;
  issue_date: string;
  expiration_date: string | null;
  does_not_expire: boolean;
  credential_id: string | null;
  credential_url: string | null;
  certificate_path: string | null;
  created_at: string;
  updated_at: string;
}
