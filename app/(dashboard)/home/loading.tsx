import { DashboardPageLayout, MetricCardsSkeleton } from "@/components/ui/loading-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function HomeLoading() {
  return (
    <DashboardPageLayout title="Home" descWidth="w-40">
      {/* Banner card skeleton */}
      <Card className="p-4 flex items-start justify-between gap-4 border-border/60 shadow-2xs">
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4.5 w-3/4 max-w-[200px]" />
          <Skeleton className="h-3.5 w-full max-w-[300px]" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md shrink-0 hidden sm:block" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0 sm:hidden" />
      </Card>

      {/* Section header + stat grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        <MetricCardsSkeleton count={4} />
      </div>
    </DashboardPageLayout>
  )
}
