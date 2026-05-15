import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const isConfigured = hasSupabaseEnv()
  const user = await getCurrentUser()

  if (user) {
    const profile = await getProfileForUser(user)
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-4">
        {!isConfigured ? <ConfigurationNotice /> : null}
        <AuthForm mode="login" isConfigured={isConfigured} />
      </div>
    </main>
  )
}
