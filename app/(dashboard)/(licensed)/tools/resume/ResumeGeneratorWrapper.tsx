"use client"

import dynamic from "next/dynamic"

export const ResumeGeneratorWrapper = dynamic(
  () => import("./ResumeGeneratorClient").then(mod => ({ default: mod.ResumeGeneratorClient })),
  { ssr: false }
)
