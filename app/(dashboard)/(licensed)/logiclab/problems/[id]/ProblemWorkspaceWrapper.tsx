"use client"

import dynamic from "next/dynamic"

export const ProblemWorkspaceWrapper = dynamic(
  () => import("../../_components/ProblemWorkspaceClient/ProblemWorkspaceClient").then(mod => ({ default: mod.ProblemWorkspaceClient })),
  { ssr: false }
)
