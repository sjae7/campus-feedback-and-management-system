import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowLeftIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  UserIcon,
} from "lucide-react"

import { AdminSuggestionStatusSelect } from "@/components/admin-suggestion-status-select"
import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { DeleteSuggestionButton } from "@/components/delete-suggestion-button"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatBytes, formatDateTime } from "@/lib/format"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getAdminSuggestion } from "@/lib/suggestions"

type AdminSuggestionDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminSuggestionDetailPage({
  params,
}: AdminSuggestionDetailPageProps) {
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

  const { id } = await params
  const suggestion = await getAdminSuggestion(id)

  if (!suggestion) {
    notFound()
  }

  return (
    <AppShell profile={profile} email={user.email} active="admin-suggestions">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <Button asChild variant="ghost">
            <Link href="/admin/suggestions">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to inbox
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
                  <CardDescription>
                    {suggestion.category} - submitted{" "}
                    {formatDateTime(suggestion.created_at)}
                  </CardDescription>
                </div>
                <StatusBadge status={suggestion.status} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7">
                  {suggestion.message}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium">Attachments</h2>
                {suggestion.suggestion_attachments?.length ? (
                  <div className="grid gap-3">
                    {suggestion.suggestion_attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileTextIcon />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {attachment.file_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatBytes(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button asChild variant="outline">
                            <a
                              href={attachment.signedUrl ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLinkIcon data-icon="inline-start" />
                              View
                            </a>
                          </Button>
                          <Button asChild>
                            <a
                              href={attachment.signedUrl ?? "#"}
                              download={attachment.file_name}
                            >
                              <DownloadIcon data-icon="inline-start" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    This suggestion has no attachments.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review status</CardTitle>
                <CardDescription>
                  This status is visible to the student.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSuggestionStatusSelect
                  suggestionId={suggestion.id}
                  status={suggestion.status}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Delete suggestion</CardTitle>
                <CardDescription>
                  Remove this suggestion and any uploaded attachments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteSuggestionButton
                  suggestionId={suggestion.id}
                  redirectToInbox
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Submitter</CardTitle>
                <CardDescription>Student account details.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <UserIcon className="mt-0.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {suggestion.students?.full_name ?? "Unknown student"}
                    </p>
                    <p className="text-muted-foreground">
                      {suggestion.students?.department_name ??
                        "No department on profile"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MailIcon className="mt-0.5 text-muted-foreground" />
                  <p className="min-w-0 truncate">
                    {suggestion.students?.email ?? "No email on profile"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
