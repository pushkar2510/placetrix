export interface SampleTestCase {
  id: string;
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface Submission {
  id: string;
  status: string;
  language_id: number;
  runtime: number | null;
  memory: number | null;
  passed_count: number;
  total_count: number;
  created_at: string;
}

export interface Problem {
  id: string;
  number?: number | null;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  time_limit: number;
  memory_limit: number;
  constraints?: string[];
  boilerplates: Record<string, string>;
  driver_codes: Record<string, string>;
  created_at?: string;
  solved_status?: string | null;
  acceptance_rate?: number | null;
  total_submissions?: number;
}

export interface CalendarCell {
  date: string;
  count: number;
  status: "none" | "attempted" | "solved";
  dayOfWeek: number;
}

export interface IdeSettings {
  fontSize: number;
  wordWrap: "on" | "off";
  buttonPosition: "toolbar" | "bottom";
}

export interface Language {
  id: number;
  name: string;
  value: string;
  extension: string;
}

export interface PotdHistoryItem {
  id: string;
  date: string;
  problem_id: string;
  number?: number;
  title: string;
  difficulty: string;
  tags?: string[];
  solved_status: string | null;
  total_submissions: number;
  acceptance_rate: number;
}
