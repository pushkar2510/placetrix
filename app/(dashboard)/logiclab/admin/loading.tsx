import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

export default function LogicLabAdminLoading() {
  return (
    <DashboardPageLayout title="Logic Lab Admin" descWidth="w-96" hasButton buttonWidth="w-80">
      {/* 2-Column Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leaderboard Table */}
        <div className="lg:col-span-8">
          <Card className="border-border/60 shadow-2xs overflow-hidden rounded-2xl">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-border/40 bg-muted/10">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-4 w-72 rounded max-w-full" />
              </div>
              <Skeleton className="h-8.5 w-24 rounded-lg shrink-0" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Search & Export Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
              </div>

              {/* Leaderboard Table Grid */}
              <div className="border border-border/60 rounded-xl overflow-hidden">
                <Table className="text-sm">
                  <TableHeader className="bg-muted/10 h-10 border-b border-border/60">
                    <TableRow className="border-b-border/60 hover:bg-transparent">
                      <TableHead className="w-16"><Skeleton className="h-4 w-6 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead className="w-24 text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                      <TableHead className="w-24 text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                      <TableHead className="w-24 text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                      <TableHead className="w-36 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-border/60 h-14 hover:bg-transparent">
                        <TableCell className="text-center font-mono"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-3.5 w-56 rounded" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-10 rounded-full mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-4 w-8 rounded mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-4 w-8 rounded mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Submission Feed */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60 shadow-2xs overflow-hidden rounded-2xl">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-border/40 bg-muted/10">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-52 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border border-border/60 rounded-xl p-3 bg-muted/5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-3.5 flex items-start justify-between gap-3 bg-card border-border/60 shadow-2xs">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-10 rounded" />
                      </div>
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
