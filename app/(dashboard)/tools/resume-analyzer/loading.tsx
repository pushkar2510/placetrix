import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DashboardPageLayout } from "@/components/ui/loading-skeleton"

export default function ResumeAnalyzerLoading() {
  return (
    <DashboardPageLayout title="Resume Analyzer" descWidth="w-full max-w-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Panel: Inputs Skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader>
              <CardTitle>Analysis Criteria</CardTitle>
              <CardDescription>Provide the materials required for the ATS analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center min-h-[160px] border-border/40">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="size-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36 mx-auto rounded" />
                      <Skeleton className="h-3 w-48 mx-auto rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Skeleton */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-11 w-full rounded-lg" />
            </CardFooter>
          </Card>
        </div>

        {/* Right Panel: Results Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ATS Score Ring Card Skeleton */}
            <Card className="sm:col-span-1 flex flex-col items-center justify-center p-6 min-h-[220px] bg-muted/15 border-border/60 shadow-2xs">
              <div className="size-24 rounded-full border-4 border-muted/30 flex items-center justify-center">
                <Skeleton className="size-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 mt-4 rounded" />
              <Skeleton className="h-3 w-20 mt-1 rounded" />
            </Card>

            {/* Keyword Match Card Skeleton */}
            <Card className="sm:col-span-2 p-6 flex flex-col justify-between min-h-[220px] border-border/60 shadow-2xs">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3.5 w-48 rounded" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6.5 w-16 rounded-full" />
                ))}
              </div>
            </Card>
          </div>

          {/* Section Feedback Skeleton */}
          <Card className="border-border/60 shadow-2xs">
            <CardHeader>
              <Skeleton className="h-5 w-40 rounded" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-3 border-border/40 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-5/6 rounded" />
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardPageLayout>
  )
}
