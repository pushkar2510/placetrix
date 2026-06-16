"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardPageLayout, TableSkeleton } from "@/components/ui/loading-skeleton"

function StudentsSkeleton({
  search,
  status,
}: {
  search: string
  status: "all" | "verified" | "pending"
}) {
  return (
    <DashboardPageLayout title="Students" descWidth="w-36">
      <div className="space-y-4">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              defaultValue={search}
              className="pl-9 pr-9 cursor-default pointer-events-none"
              readOnly
            />
          </div>
          
          <div className="flex items-center border border-border/60 rounded-xl p-1 bg-muted/50 pointer-events-none">
            {(["all", "verified", "pending"] as const).map((filter) => (
              <button
                type="button"
                key={filter}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all",
                  status === filter
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={10} cols={6} colWidths={["w-[28%]", "w-[26%]", "w-[11%]", "w-[11%]", "w-[12%]", "w-[12%]"]} />
      </div>
    </DashboardPageLayout>
  )
}

function StudentsLoadingContent() {
  const searchParams = useSearchParams()
  const search = searchParams?.get("search") || ""
  const status = (searchParams?.get("status") || "all") as "all" | "verified" | "pending"

  return <StudentsSkeleton search={search} status={status} />
}

export default function StudentsLoading() {
  return (
    <Suspense fallback={<StudentsSkeleton search="" status="all" />}>
      <StudentsLoadingContent />
    </Suspense>
  )
}
