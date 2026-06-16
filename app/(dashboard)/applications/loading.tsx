import { DashboardPageLayout, CardGridSkeleton } from "@/components/ui/loading-skeleton"

export default function ApplicationsLoading() {
  return (
    <DashboardPageLayout title="My Applications" descWidth="w-32" hasButton buttonWidth="w-24">
      <CardGridSkeleton count={8} />
    </DashboardPageLayout>
  )
}
