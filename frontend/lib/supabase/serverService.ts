import { createServerClient } from "@supabase/ssr";
import { cookies } from 'next/headers';

/**
 * Create a server-side Supabase client using the service role key.
 * Use this for privileged server-only operations like uploading to storage
 * or performing admin tasks. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in env.
 */
export function createServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } } as any
  );
}
