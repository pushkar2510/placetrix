import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

function StatCardSkeleton() {
  return (
    <Card className="border-border/60 shadow-2xs rounded-xl">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-3.5 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-7 w-12 rounded" />
      </CardContent>
    </Card>
  )
}

export default function ApplicationsListLoading() {
  return (
    <DashboardPageLayout title="Job Applicants" descWidth="w-40">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Filters Bar */}
      <Card className="flex flex-col gap-2 rounded-xl border-border/60 bg-muted/10 p-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-9.5 flex-1 rounded-lg" />
          <Skeleton className="h-9.5 w-24 rounded-lg shrink-0" />
        </div>
      </Card>

      {/* Desktop Table Skeleton */}
      <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block bg-card shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/10 border-b border-border/60 h-11">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6"><Skeleton className="h-4 w-20 rounded" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24 rounded" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16 rounded" /></TableHead>
              <TableHead className="text-right pr-6"><Skeleton className="h-4 w-16 ml-auto rounded" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent border-b border-border/60 h-14">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3.5 w-36 rounded" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                <TableCell><Skeleton className="h-5.5 w-16 rounded-full" /></TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8.5 w-16 rounded-lg" />
                    <Skeleton className="h-8.5 w-24 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Accordion Placeholder */}
      <div className="rounded-xl border border-border/60 overflow-hidden md:hidden bg-card divide-y shadow-2xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-5.5 w-16 rounded-full" />
            </div>
            <Skeleton className="size-4 rounded shrink-0" />
          </div>
        ))}
      </div>
    </DashboardPageLayout>
  )
}
