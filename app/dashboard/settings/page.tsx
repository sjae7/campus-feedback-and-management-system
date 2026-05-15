import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { ProfileSettingsForm } from "@/components/profile-settings-form"
import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const isConfigured = hasSupabaseEnv()

  if (!isConfigured) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center px-6">
        <ConfigurationNotice />
      </main>
    )
  }

  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getProfileForUser(user)

  if (!profile) {
    redirect("/login")
  }

  if (profile.role === "admin") {
    redirect("/admin")
  }

  return (
    <AppShell profile={profile} email={user.email} active="settings">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="max-w-2xl">
          <ProfileSettingsForm profile={profile} />
        </div>
      </main>
    </AppShell>
  )
}
