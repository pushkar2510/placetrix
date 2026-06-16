import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

function TestCardSkeleton() {
  return (
    <Card className="border-border/60 shadow-2xs flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        {/* Left: Title, Description, Status */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-5.5 w-14 rounded-full shrink-0" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-1/2 rounded" />
          </div>
        </div>

        {/* Middle: Details & Meta */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground border-t border-border/40 md:border-t-0 pt-3 md:pt-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 min-w-[90px]">
              <Skeleton className="h-2 w-10 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end md:pl-4 border-t border-border/40 md:border-t-0 pt-3 md:pt-0 shrink-0 w-full md:w-auto">
          <Skeleton className="h-8.5 w-full md:w-24 rounded-lg" />
        </div>
      </div>
    </Card>
  )
}

export default function TestsLoading() {
  return (
    <DashboardPageLayout title="Tests" descWidth="w-36" hasButton buttonWidth="w-28">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            className="pl-9 pr-9 cursor-default pointer-events-none"
            readOnly
          />
        </div>

        <div className="overflow-x-auto shrink-0">
          <div className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-muted/40 p-1 border border-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-7.5 rounded-lg shrink-0"
                style={{ width: `${55 + (i % 3) * 15}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <TestCardSkeleton key={i} />
        ))}
      </div>
    </DashboardPageLayout>
  )
}