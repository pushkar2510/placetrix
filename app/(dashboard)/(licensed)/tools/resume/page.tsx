// app/resume/page.tsx
import dynamic from "next/dynamic"

const ResumeGeneratorClient = dynamic(
  () => import("./ResumeGeneratorClient").then(mod => ({ default: mod.ResumeGeneratorClient })),
  { ssr: false }
)

export const metadata = {
  title: "Resume Builder",
  description: "ATS-optimised resume builder with a LaTeX-inspired layout",
}

export default function ResumePage() {
  return <ResumeGeneratorClient />
}