import { redirect } from "next/navigation"
import Link from "next/link"
import {
  ClipboardListIcon,
  MailIcon,
  MessageSquareTextIcon,
  SendIcon,
} from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { StudentMetricCardGrid } from "@/components/metric-card-grid"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getUserSuggestionDashboard } from "@/lib/suggestions"
import { formatDateTime } from "@/lib/format"

export const dynamic = "force-dynamic"

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

  const profile = await getProfileForUser(user)

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  const { counts, recentSuggestions } = await getUserSuggestionDashboard(user.id)

  return (
    <AppShell profile={profile} email={user.email} active="dashboard">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <StudentMetricCardGrid counts={counts} />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                {profile?.role === "teacher" ? "Teacher account" : "Student account"}
              </CardTitle>
              <CardDescription>
                Your signed-in email account for campus suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MailIcon />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {profile?.full_name ??
                      (profile?.role === "teacher" ? "Teacher" : "Student")}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.department_name ?? "No department selected"}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="justify-start">
                  <Link href="/dashboard/new">
                    <SendIcon data-icon="inline-start" />
                    Submit feedback
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/suggestions">
                    <ClipboardListIcon data-icon="inline-start" />
                    Track suggestions
                  </Link>
                </Button>
                {profile?.role === "teacher" ? (
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start sm:col-span-2"
                  >
                    <Link href="/dashboard/student-feedback">
                      <MessageSquareTextIcon data-icon="inline-start" />
                      Review student feedback
                    </Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent status</CardTitle>
              <CardDescription>
                A short preview only. Open My feedback and suggestions to see
                everything.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentSuggestions.length ? (
                recentSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{suggestion.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.category} -{" "}
                        {formatDateTime(suggestion.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={suggestion.status} />
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No suggestions yet. Submit your first campus suggestion from
                  the Submit page.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  )
}
