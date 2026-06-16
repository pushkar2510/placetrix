import { DashboardPageLayout, TableSkeleton } from "@/components/ui/loading-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function LogicLabLoading() {
  return (
    <DashboardPageLayout title="Logic Lab" descWidth="w-80" hasButton buttonWidth="w-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[180px] w-full rounded-2xl" />
        <Skeleton className="h-[180px] w-full rounded-2xl" />
        <Skeleton className="h-[180px] w-full rounded-2xl" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Search & Difficulty (Left) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
          <Skeleton className="h-10 w-full sm:w-[160px] rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
        {/* Tabs (Right) */}
        <Skeleton className="h-10 w-full xl:w-[320px] rounded-xl" />
      </div>

      {/* Table */}
      <TableSkeleton rows={8} cols={5} colWidths={["w-36", "w-16", "w-20", "w-12", "w-14"]} />
    </DashboardPageLayout>
  )
}
