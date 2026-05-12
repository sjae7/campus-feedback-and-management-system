import { redirect } from "next/navigation"

import { AdminSuggestionsTable } from "@/components/admin-suggestions-table"
import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { CreateUserForm } from "@/components/create-user-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getAdminSuggestions, getStatusCounts } from "@/lib/suggestions"

export default async function AdminPage() {
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

  const profile = await getCurrentProfile()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const suggestions = await getAdminSuggestions()
  const counts = getStatusCounts(suggestions)

  return (
    <AppShell profile={profile} active="admin">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total" value={counts.total} />
          <MetricCard label="New" value={counts.new} />
          <MetricCard label="Reviewing" value={counts.reviewing} />
          <MetricCard label="Resolved" value={counts.resolved} />
          <MetricCard label="Rejected" value={counts.rejected} />
        </div>
        <CreateUserForm />
        <Card>
          <CardHeader>
            <CardTitle>Suggestion inbox</CardTitle>
            <CardDescription>
              Filter campus suggestions and update triage status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <Empty className="min-h-64">
                <EmptyHeader>
                  <EmptyTitle>No suggestions submitted</EmptyTitle>
                  <EmptyDescription>
                    User submissions will appear here for admin review.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <AdminSuggestionsTable suggestions={suggestions} />
            )}
          </CardContent>
        </Card>
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
