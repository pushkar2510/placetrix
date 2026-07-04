import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

export default function TestEditorLoading() {
  return (
    <DashboardPageLayout title="Edit Test" descWidth="w-64" hasButton buttonWidth="w-52">
      {/* Settings Card */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3.5 w-48 mt-1 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-8 rounded" />
            <Skeleton className="h-9.5 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-9.5 w-40 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
          </div>
          <div className="pt-1">
            <Skeleton className="h-9.5 w-36 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Questions Card */}
      <Card className="opacity-50 border-border/60 shadow-2xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-3.5 w-52 mt-1 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8.5 w-28 rounded-lg" />
              <Skeleton className="h-8.5 w-20 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-10">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-1.5 text-center">
              <Skeleton className="h-4 w-32 mx-auto rounded" />
              <Skeleton className="h-3.5 w-52 mx-auto rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
