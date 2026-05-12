import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { SuggestionForm } from "@/components/suggestion-form"
import { UserSuggestionsList } from "@/components/user-suggestions-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getStatusCounts, getUserSuggestions } from "@/lib/suggestions"

export default async function DashboardPage() {
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
  const counts = getStatusCounts(suggestions)

  return (
    <AppShell profile={profile} active="dashboard">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={counts.total} />
          <MetricCard label="New" value={counts.new} />
          <MetricCard label="Reviewing" value={counts.reviewing} />
          <MetricCard label="Resolved" value={counts.resolved} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SuggestionForm />
          <UserSuggestionsList suggestions={suggestions} />
        </div>
      </main>
    </AppShell>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
