import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

function MetaItemSkeleton() {
  return (
    <Card className="flex items-start gap-2.5 rounded-xl border-border/60 bg-muted/20 p-3.5 shadow-2xs">
      <Skeleton className="mt-0.5 size-3.5 shrink-0 rounded" />
      <div className="space-y-1.5">
        <Skeleton className="h-2.5 w-14 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </Card>
  )
}

function StatsCardSkeleton() {
  return (
    <Card className="rounded-xl border-border/60 p-4 space-y-2.5 shadow-2xs">
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-3.5 rounded" />
        <Skeleton className="h-3.5 w-20 rounded" />
      </div>
      <Skeleton className="h-8 w-12 rounded" />
      <Skeleton className="h-3.5 w-24 rounded" />
    </Card>
  )
}

function QuestionRowSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border-border/60 px-4 py-3 shadow-2xs">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-px h-5.5 w-6 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4.5 w-full rounded" />
          <Skeleton className="h-4.5 w-3/4 rounded" />
          <div className="flex gap-1.5 pt-0.5">
            <Skeleton className="h-4.5 w-12 rounded-full" />
            <Skeleton className="h-4.5 w-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="size-4 shrink-0 rounded" />
      </div>
    </Card>
  )
}

export default function Loading() {
  return (
    <DashboardPageLayout title="" descWidth="w-72" hasButton buttonWidth="w-24">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        {/* Tab list */}
        <div className="inline-flex h-9.5 gap-1.5 rounded-xl bg-muted/40 p-1 border border-border/40">
          <Skeleton className="h-7.5 w-24 rounded-lg" />
          <Skeleton className="h-7.5 w-24 rounded-lg" />
          <Skeleton className="h-7.5 w-24 rounded-lg" />
        </div>

        {/* Overview Tab: Test Details card */}
        <div className="space-y-4">
          <Card className="border-border/60 p-5 space-y-5 shadow-2xs">
            <div className="space-y-1">
              <Skeleton className="h-4.5 w-28 rounded" />
              <Skeleton className="h-3.5 w-52 rounded" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>

            {/* Instructions block */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 shadow-2xs">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>

            <Separator />

            {/* Meta grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetaItemSkeleton />
              <MetaItemSkeleton />
              <MetaItemSkeleton />
              <MetaItemSkeleton />
            </div>
          </Card>

          {/* Overview Tab: Controls card */}
          <Card className="border-border/60 p-5 space-y-4 shadow-2xs">
            <div className="space-y-1">
              <Skeleton className="h-4.5 w-20 rounded" />
              <Skeleton className="h-3.5 w-56 rounded" />
            </div>

            {/* Visibility row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4.5 w-20 rounded" />
                <Skeleton className="h-3.5 w-56 rounded" />
              </div>
              <Skeleton className="h-8.5 w-full shrink-0 rounded-lg sm:w-28" />
            </div>

            <Separator />

            {/* Results row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4.5 w-16 rounded" />
                <Skeleton className="h-3.5 w-56 rounded" />
              </div>
              <Skeleton className="h-8.5 w-full shrink-0 rounded-lg sm:w-28" />
            </div>
          </Card>

          {/* Questions preview (subtle) */}
          <div className="space-y-2">
            <QuestionRowSkeleton />
            <QuestionRowSkeleton />
            <QuestionRowSkeleton />
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
