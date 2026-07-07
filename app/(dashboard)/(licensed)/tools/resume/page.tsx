// app/resume/page.tsx
import { ResumeGeneratorWrapper } from "./ResumeGeneratorWrapper"

export const metadata = {
  title: "Resume Builder",
  description: "ATS-optimised resume builder with a LaTeX-inspired layout",
}

export default function ResumePage() {
  return <ResumeGeneratorWrapper />
}