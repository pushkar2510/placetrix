import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { PublicPageLayout } from "@/components/ui/loading-skeleton"

export default function TermsOfServiceLoading() {
  return (
    <PublicPageLayout>
      {/* Hero Section Skeleton */}
      <section className="py-14 md:py-20 text-center flex flex-col items-center">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 space-y-4 flex flex-col items-center">
          <Skeleton className="h-3.5 w-28 uppercase tracking-widest rounded" />
          <Skeleton className="h-10 w-4/5 max-w-lg rounded" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
          <Skeleton className="h-4 w-3/4 max-w-lg rounded" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6.5 w-32 rounded-full" />
            <Skeleton className="h-6.5 w-20 rounded-full" />
          </div>
        </div>
      </section>

      {/* Body Content Skeleton */}
      <section className="py-10">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <Card className="p-6 backdrop-blur-sm border-border/60 shadow-2xs md:p-8 lg:p-10 space-y-8">
            {/* Category links skeleton */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6.5 w-24 rounded-full" />
              ))}
            </div>

            {/* Sections list skeleton */}
            <div className="space-y-10 mt-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-48 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  {i !== 2 && <div className="h-px w-full bg-border/40 mt-8" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PublicPageLayout>
  )
}
