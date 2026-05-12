import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { ConfigurationNotice } from "@/components/configuration-notice"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"

export default async function SignupPage() {
  const isConfigured = hasSupabaseEnv()
  const user = await getCurrentUser()

  if (user) {
    const profile = await getCurrentProfile()
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-4">
        {!isConfigured ? <ConfigurationNotice /> : null}
        <AuthForm mode="signup" isConfigured={isConfigured} />
      </div>
    </main>
  )
}
