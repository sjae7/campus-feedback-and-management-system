import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { TeacherFeedbackList } from "@/components/teacher-feedback-list"
import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { getTeacherReviewSuggestions } from "@/lib/suggestions"

export const dynamic = "force-dynamic"

export default async function StudentFeedbackPage() {
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

  if (profile?.role !== "teacher") {
    redirect("/dashboard")
  }

  const suggestions = await getTeacherReviewSuggestions(user.id)

  return (
    <AppShell profile={profile} email={user.email} active="student-feedback">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <TeacherFeedbackList suggestions={suggestions} />
      </main>
    </AppShell>
  )
}
