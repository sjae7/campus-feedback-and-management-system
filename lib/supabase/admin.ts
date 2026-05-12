import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabaseAdminEnv } from "@/lib/env"

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminEnv()

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
