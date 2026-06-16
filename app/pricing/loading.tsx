import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { PublicPageLayout } from "@/components/ui/loading-skeleton"

export default function PricingLoading() {
  return (
    <PublicPageLayout>
      {/* Hero Section Skeleton */}
      <section className="py-14 md:py-20 text-center flex flex-col items-center">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 space-y-4 flex flex-col items-center">
          <Skeleton className="h-3.5 w-20 uppercase tracking-widest rounded" />
          <Skeleton className="h-10 w-4/5 max-w-lg rounded" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
      </section>

      {/* Current Plan Section Skeleton */}
      <section className="py-10">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <Card className="p-6 backdrop-blur-sm border-border/60 shadow-2xs md:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="h-3.5 w-28 uppercase rounded" />
                <Skeleton className="h-10 w-3/4 max-w-md rounded" />
                <Skeleton className="h-4 w-full max-w-lg rounded" />
                <Skeleton className="h-4 w-5/6 max-w-md rounded" />
              </div>
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center p-6 border-t lg:border-t-0 lg:border-l border-border/40 space-y-4">
                <Skeleton className="h-14 w-28 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-40 rounded-full" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Future Plans Section Skeleton */}
      <section className="py-14 md:py-20 text-center flex flex-col items-center">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 space-y-4 flex flex-col items-center">
          <Skeleton className="h-3.5 w-28 uppercase tracking-widest rounded" />
          <Skeleton className="h-10 w-4/5 max-w-lg rounded" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
      </section>
    </PublicPageLayout>
  )
}
