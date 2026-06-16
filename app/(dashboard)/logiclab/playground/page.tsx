import { getUserProfile } from "@/lib/supabase/profile"
import PlaygroundWorkspaceClient from "../_components/PlaygroundWorkspaceClient"

export const metadata = {
  title: "Playground — LogicLab",
  description: "A free programming sandbox to write, execute, and test code.",
}

export default async function PlaygroundPage() {
  const profile = await getUserProfile()
  return <PlaygroundWorkspaceClient userId={profile?.id} />
}

