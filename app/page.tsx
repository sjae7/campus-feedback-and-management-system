import Link from "next/link"
import { ArrowRightIcon, ClipboardListIcon, ShieldCheckIcon } from "lucide-react"

import { ConfigurationNotice } from "@/components/configuration-notice"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { hasSupabaseEnv } from "@/lib/env"

export default function Home() {
  const isConfigured = hasSupabaseEnv()

  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-10 px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-3 py-1 text-sm text-muted-foreground">
              <ClipboardListIcon />
              Campus feedback and management
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Campus Voice
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                A suggestion system where students submit campus ideas with an
                account, and admins review every message in a dedicated triage
                dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Student dashboard
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/admin">Admin dashboard</Link>
              </Button>
            </div>
            {!isConfigured ? <ConfigurationNotice /> : null}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>
                Simple submission, private attachments, and admin triage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                "Users create an account before submitting suggestions.",
                "Suggestions can include an optional file attachment.",
                "Admins filter, review, and update suggestion status.",
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <ShieldCheckIcon />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Row-level security keeps normal users limited to their own
                  suggestions while admins can review the campus inbox.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
