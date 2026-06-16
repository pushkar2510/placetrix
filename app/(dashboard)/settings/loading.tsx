import { DashboardPageLayout, FormSkeleton } from "@/components/ui/loading-skeleton"

export default function SettingsLoading() {
  return (
    <DashboardPageLayout title="Settings" descWidth="w-64" hasTabs tabCount={6}>
      <FormSkeleton sectionCount={4} />
    </DashboardPageLayout>
  )
}