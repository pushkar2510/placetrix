import { DashboardPageLayout, CardGridSkeleton } from "@/components/ui/loading-skeleton"

export default function PostingsLoading() {
  return (
    <DashboardPageLayout title="Job Postings" descWidth="w-28" hasButton buttonWidth="w-28" hasTabs tabCount={5}>
      <CardGridSkeleton count={8} />
    </DashboardPageLayout>
  )
}
