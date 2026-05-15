import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { CreateUserForm } from "@/components/create-user-form"
import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <AppShell profile={profile} email={user.email} active="admin-users">
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="max-w-3xl">
          <CreateUserForm />
        </div>
      </main>
    </AppShell>
  )
}
