import "server-only"

import { cache } from "react"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export const getCurrentUser = cache(async () => {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle()

  if (data) {
    return data as Profile
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user.email

  const { data: createdProfile } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: fullName,
      role: "user",
    })
    .select("id, full_name, role, created_at, updated_at")
    .single()

  return (createdProfile as Profile | null) ?? null
})

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return user
}

export async function requireAdmin() {
  const profile = await getCurrentProfile()

  if (profile?.role !== "admin") {
    return null
  }

  return profile
}
