import { DashboardPageLayout, CardGridSkeleton } from "@/components/ui/loading-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function JobsLoading() {
  return (
    <DashboardPageLayout title="Job Board" descWidth="w-40">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-9.5 w-full sm:max-w-xs rounded-lg" />
      </div>

      {/* Card Grid */}
      <CardGridSkeleton count={8} />
    </DashboardPageLayout>
  )
}
