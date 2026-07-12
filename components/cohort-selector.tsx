// components/cohort-selector.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UsersRound, Loader2 } from "lucide-react"
import { getCohortOptionsAction } from "@/app/(dashboard)/(licensed)/cohorts/actions"
import type { CohortOption } from "@/app/(dashboard)/(licensed)/cohorts/types"

interface CohortSelectorProps {
  selectedCohortIds: string[]
  onChange: (ids: string[]) => void
  /** Optional pre-loaded cohorts to avoid an extra fetch */
  cohorts?: CohortOption[]
  error?: string
}

export function CohortSelector({
  selectedCohortIds,
  onChange,
  cohorts: propCohorts,
  error,
}: CohortSelectorProps) {
  const [cohorts, setCohorts] = useState<CohortOption[]>(propCohorts ?? [])
  const [loading, setLoading] = useState(!propCohorts)

  useEffect(() => {
    if (propCohorts) {
      setCohorts(propCohorts)
      return
    }
    getCohortOptionsAction()
      .then(setCohorts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) => {
    onChange(
      selectedCohortIds.includes(id)
        ? selectedCohortIds.filter((c) => c !== id)
        : [...selectedCohortIds, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading cohorts...
      </div>
    )
  }

  if (cohorts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-1">
        No cohorts found. Create cohorts first from the Cohorts page.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {cohorts.map((cohort) => {
          const isSelected = selectedCohortIds.includes(cohort.id)
          return (
            <button
              key={cohort.id}
              type="button"
              onClick={() => toggle(cohort.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background hover:bg-accent border-border/80 text-foreground"
              )}
            >
              <UsersRound className="h-3 w-3" />
              {cohort.name}
              <span
                className={cn(
                  "text-[10px] px-1 py-0 rounded font-normal",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {cohort.student_count}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
