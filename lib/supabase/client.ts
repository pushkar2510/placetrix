import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

let client: ReturnType<typeof createBrowserClient<Database, "public">> | null = null;

/**
 * Returns a singleton browser Supabase client.
 * Safe to call repeatedly — only one instance is created per page load.
 */
export function createClient() {
  if (client) return client;

  client = createBrowserClient<Database, "public">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        // @ts-ignore
        suppressGetSessionWarning: true,
      },
    }
  );

  return client;
}
