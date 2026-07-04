import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

export default function TestResultLoading() {
  return (
    <DashboardPageLayout title="" descWidth="w-72" hasButton={false}>
      {/* Score Card */}
      <Card className="border-border/60 p-5 space-y-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-9.5 w-24 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Skeleton className="h-8.5 w-24 rounded-lg" />
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </Card>

      {/* Question Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4.5 w-24 rounded" />
          <Skeleton className="h-5.5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 flex items-center justify-between border-border/60 shadow-2xs">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="size-5 rounded shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3.5 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="size-4 rounded shrink-0" />
            </Card>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  )
}
