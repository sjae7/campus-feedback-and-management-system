import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { StudentMetricCardGrid } from "@/components/metric-card-grid"
import { UserSuggestionsList } from "@/components/user-suggestions-list"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getStatusCounts, getUserSuggestions } from "@/lib/suggestions"

export default async function MySuggestionsPage() {
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

  const [profile, suggestions] = await Promise.all([
    getCurrentProfile(),
    getUserSuggestions(user.id),
  ])

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  const counts = getStatusCounts(suggestions)

  return (
    <AppShell profile={profile} email={user.email} active="my-suggestions">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <StudentMetricCardGrid counts={counts} />
        <UserSuggestionsList suggestions={suggestions} />
      </main>
    </AppShell>
  )
}
