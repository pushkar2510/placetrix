import { AppSidebar } from "@/components/app-sidebar"
import { getUserProfile } from "@/lib/supabase/profile"
import { DashboardShell } from "@/components/dashboard-shell"
import { getLicenseForProfile } from "@/lib/supabase/license"
import { LicenseProvider } from "@/components/license/LicenseProvider"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // getUserProfile() handles all redirect cases internally:
    //   • Revoked session (online 401)  → signs out + redirects
    //   • Token expired offline          → redirects
    //   • Network failure + valid JWT   → returns minimal offline profile
    // If we reach this line, profile is always a valid object.
    const profile = await getUserProfile()

    // Fetch license for all non-admin institute-linked users.
    // Admins get null (bypass all license checks).
    const license = profile ? await getLicenseForProfile(profile) : null

    return (
        <LicenseProvider
            license={license}
            isAdmin={profile?.account_type === "admin"}
        >
            <DashboardShell
                sidebar={<AppSidebar user={profile} />}
            >
                {children}
            </DashboardShell>
        </LicenseProvider>
    )
}
