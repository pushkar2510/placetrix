import { DashboardPageLayout, FormSkeleton } from "@/components/ui/loading-skeleton"

export default function ProfileLoading() {
  return (
    <DashboardPageLayout title="My Profile" descWidth="w-72">
      <FormSkeleton sectionCount={3} />
    </DashboardPageLayout>
  )
}
