import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  MailIcon,
  UserPlusIcon,
} from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { MetricCard } from "@/components/metric-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <AppShell profile={profile} email={user.email} active="admin">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total suggestions" value={counts.total} />
          <MetricCard label="New" value={counts.new} />
          <MetricCard label="Reviewing" value={counts.reviewing} />
          <MetricCard
            label="Approved"
            value={counts.approved + counts.resolved}
            icon={CheckCircle2Icon}
          />
          <MetricCard label="Rejected" value={counts.rejected} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Admin account</CardTitle>
              <CardDescription>
                Your admin email account and role for managing campus feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MailIcon />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {profile?.full_name ?? "Admin"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/admin/suggestions">
                    <ClipboardListIcon data-icon="inline-start" />
                    Open inbox
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/users">
                    <UserPlusIcon data-icon="inline-start" />
                    Create account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admin workflow</CardTitle>
              <CardDescription>
                Keep review work separated from account creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg border p-4">
                <p className="font-medium">1. Review suggestions</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Use Admin inbox for search, filtering, attachments, and status
                  updates.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">2. Approve or reject</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Status changes are visible to students on their My suggestions
                  page.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">3. Create accounts separately</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Add student or admin email accounts from the Accounts page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  )
}
