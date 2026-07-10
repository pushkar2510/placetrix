"use server"

import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/supabase/profile"
import OpenAI from "openai"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SectionScore {
  name: string
  score: number
  feedback: string
  /** Generic tip */
  suggestion: string
  /** Concrete before/after rewrite example */
  rewriteExample?: {
    before: string
    after: string
  }
}

export interface KeywordItem {
  keyword: string
  /** How many times it appears in the resume */
  count: number
  /** Is it a high-value industry keyword for this role? */
  important: boolean
}

export interface QuickWin {
  title: string
  impact: "High" | "Medium" | "Low"
  action: string
}

export interface AnalysisResult {
  overallScore: number
  atsScore: number
  keywordMatchRate: number
  /** 2–3 sentence AI narrative summary of the resume */
  verdict: string
  sections: SectionScore[]
  strengths: string[]
  weaknesses: string[]
  /** Keyed by weakness text — specific fix suggestion */
  suggestions: Record<string, string>
  quickWins: QuickWin[]
  keywords: KeywordItem[]
  suggestedKeywords: string[]
  jdMatchScore?: number
  missingSkills?: string[]
  detectedSkills?: string[]
  fileName: string
  analyzedAt: string
}

// ─────────────────────────────────────────────
// Text extraction helpers
// ─────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf-parse is CJS — dynamically require to avoid ESM issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse")
  const data = await pdfParse(buffer)
  return data.text as string
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

// ─────────────────────────────────────────────
// Main server action
// ─────────────────────────────────────────────

export async function analyzeResumeAction(formData: FormData): Promise<AnalysisResult> {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("AI analysis is not configured. GROQ_API_KEY is missing.")

  const file = formData.get("file") as File | null
  const jobDescription = (formData.get("jobDescription") as string) || ""

  if (!file) throw new Error("No file provided.")

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PDF and DOCX files are supported.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be under 5 MB.")
  }

  // Extract text
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let resumeText: string
  if (file.type === "application/pdf") {
    resumeText = await extractPdfText(buffer)
  } else {
    resumeText = await extractDocxText(buffer)
  }

  if (!resumeText.trim())
    throw new Error("Could not extract text from the file. Please try a different file.")

  const truncatedText = resumeText.slice(0, 8000)
  const hasJD = jobDescription.trim().length > 20

  const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  })

  const systemPrompt = `You are a senior career coach, ATS specialist, and technical recruiter with 15+ years of experience.
Analyze the provided resume with surgical precision. Be brutally honest but constructive.
Your output must be a single raw JSON object — no markdown, no code fences, zero extra text before or after the JSON.
Every rewrite example must be SPECIFIC to the actual content in this resume, not generic placeholders.`

  const userPrompt = `Analyze this resume and return ONLY a raw JSON object with this exact shape (no markdown, no explanation):

{
  "overallScore": <integer 0-100>,
  "atsScore": <integer 0-100>,
  "keywordMatchRate": <integer 0-100>,
  "verdict": "<2-3 sentence honest narrative summary of the resume's strengths and biggest gap. Be specific, reference actual content.>",
  "sections": [
    {
      "name": "Summary",
      "score": <0-100>,
      "feedback": "<1 specific sentence referencing actual content from the resume>",
      "suggestion": "<actionable rewrite tip referencing this resume specifically>",
      "rewriteExample": {
        "before": "<exact phrase or sentence from the resume that needs improvement>",
        "after": "<improved version — same topic, better impact, stronger verbs, quantified if possible>"
      }
    },
    {
      "name": "Experience",
      "score": <0-100>,
      "feedback": "<1 specific sentence>",
      "suggestion": "<actionable tip>",
      "rewriteExample": {
        "before": "<an actual weak bullet point from the resume>",
        "after": "<rewritten with strong action verb + quantified result, e.g. 'Reduced load time by 40% by migrating to Redis cache'>"
      }
    },
    {
      "name": "Skills",
      "score": <0-100>,
      "feedback": "<1 specific sentence>",
      "suggestion": "<actionable tip>",
      "rewriteExample": {
        "before": "<how skills are currently presented>",
        "after": "<better presentation with context or grouping>"
      }
    },
    {
      "name": "Education",
      "score": <0-100>,
      "feedback": "<1 specific sentence>",
      "suggestion": "<actionable tip>",
      "rewriteExample": {
        "before": "<current education entry as written>",
        "after": "<enhanced version with relevant coursework, GPA if strong, or honors>"
      }
    },
    {
      "name": "Formatting",
      "score": <0-100>,
      "feedback": "<1 specific sentence>",
      "suggestion": "<actionable tip>",
      "rewriteExample": {
        "before": "<a formatting issue observed>",
        "after": "<corrected version>"
      }
    }
  ],
  "strengths": [
    "<specific strength referencing actual resume content>",
    "<specific strength>",
    "<specific strength>"
  ],
  "weaknesses": [
    "<specific weakness referencing actual content>",
    "<specific weakness>",
    "<specific weakness>"
  ],
  "suggestions": {
    "<weakness 1 text exactly>": "<2-3 sentence specific fix with an example>",
    "<weakness 2 text exactly>": "<2-3 sentence specific fix with an example>",
    "<weakness 3 text exactly>": "<2-3 sentence specific fix with an example>"
  },
  "quickWins": [
    {
      "title": "<short action title, e.g. 'Quantify your impact'>",
      "impact": "High",
      "action": "<specific 1-2 sentence instruction that can be done immediately, referencing actual resume content>"
    },
    {
      "title": "<quick win 2>",
      "impact": "High",
      "action": "<specific instruction>"
    },
    {
      "title": "<quick win 3>",
      "impact": "Medium",
      "action": "<specific instruction>"
    }
  ],
  "keywords": [
    { "keyword": "<keyword actually found in resume>", "count": <integer>, "important": <true if high-value industry keyword> },
    ... (up to 12 keywords found in the resume)
  ],
  "suggestedKeywords": [
    "<keyword missing from resume that would strengthen it for this role>",
    ... (up to 8 suggested keywords)
  ],
  "detectedSkills": ["<skill1>", "<skill2>", ... up to 10]${
    hasJD
      ? `,
  "jdMatchScore": <integer 0-100, how well resume matches the job description>,
  "missingSkills": ["<skill required by JD but absent from resume>", ...]`
      : ""
  }
}

RESUME TEXT:
${truncatedText}
${
  hasJD
    ? `
JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}`
    : ""
}`

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.25,
    max_tokens: 3000,
  })

  const content = response.choices[0]?.message?.content ?? ""

  let parsed: Omit<AnalysisResult, "fileName" | "analyzedAt">
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in AI response")
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error("AI returned an invalid response. Please try again.")
  }

  return {
    ...parsed,
    fileName: file.name,
    analyzedAt: new Date().toISOString(),
  }
}
