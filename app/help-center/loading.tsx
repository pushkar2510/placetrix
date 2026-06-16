import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { PublicPageLayout } from "@/components/ui/loading-skeleton"

export default function HelpCenterLoading() {
  return (
    <PublicPageLayout>
      {/* Hero Section Skeleton */}
      <section className="py-10 text-center flex flex-col items-center">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 space-y-4 flex flex-col items-center">
          <Skeleton className="h-3.5 w-24 uppercase tracking-widest rounded" />
          <Skeleton className="h-10 w-3/4 max-w-md rounded" />
          <div className="space-y-2 pt-2 w-full flex flex-col items-center">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        </div>
      </section>

      {/* Body Section Skeleton */}
      <section className="py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="border-border/60 shadow-2xs p-6 space-y-6 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                  </div>
                </div>
                <Skeleton className="h-11 w-full rounded-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
