// ─────────────────────────────────────────────────────────────────────────────
// app/postings/page.tsx
// Postings was a recruiter-only feature — recruiter role has been removed.
// Redirect all users back to home.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation"

export default async function PostingsPage() {
  redirect("/home")
}
