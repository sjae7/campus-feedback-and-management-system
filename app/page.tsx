import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ClipboardListIcon,
  HomeIcon,
  InboxIcon,
  LightbulbIcon,
  MailIcon,
  ShieldCheckIcon,
  SendIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react"

import { ConfigurationNotice } from "@/components/configuration-notice"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { hasSupabaseEnv } from "@/lib/env"

export const dynamic = "force-static"

const creators = [
  "Andrea Faye S. Baldemoro",
  "Sheren Joy A. Broñosa",
  "Gilleanne R. Penis",
  "Cheriza Juvie S. Salaber",
]

const workflow = [
  {
    title: "Send feedback",
    text: "Students submit feedback and suggestions with optional attachments.",
    icon: ClipboardListIcon,
  },
  {
    title: "Review inbox",
    text: "Admins open each detail page, view files, and update status.",
    icon: InboxIcon,
  },
  {
    title: "Track progress",
    text: "Students see whether feedback is new, reviewing, approved, or rejected.",
    icon: CheckCircle2Icon,
  },
]

const studentPreviewMetrics = [
  ["Total suggestions", "2", ClipboardListIcon],
  ["New", "1", Clock3Icon],
  ["Reviewing", "1", null],
  ["Approved", "0", CheckCircle2Icon],
] as const

const studentPreviewStatuses = [
  ["Add more Wi-Fi access points in the library", "Technology", "Reviewing"],
  ["Open a quiet study room for thesis groups", "Academic", "New"],
] as const

export default function Home() {
  const isConfigured = hasSupabaseEnv()

  return (
    <main className="min-h-svh overflow-hidden bg-background">
      <section className="relative border-b">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/generated/landing-concept.png')] bg-cover bg-center opacity-[0.035]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,155,222,0.08),rgba(255,255,255,0)_45%,rgba(242,145,55,0.08))]" />
        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-5 py-5 md:px-8">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <LightbulbIcon />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Campus Voice</p>
                <p className="truncate text-xs text-muted-foreground">
                  Feedback and suggestions
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Student dashboard
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-8">
            <div className="flex flex-col gap-7">
              <div className="flex w-fit items-center gap-2 rounded-lg border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur">
                <SparklesIcon />
                Campus feedback and management system
              </div>
              <div className="flex flex-col gap-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-balance md:text-6xl">
                  Feedback and suggestions for a better campus.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Campus Voice gives students a simple place to submit ideas,
                  concerns, and attachments while admins review every message in
                  a focused inbox.
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

            <div className="relative min-w-0">
              <div className="overflow-hidden rounded-lg border bg-background/95 shadow-xl shadow-primary/10 backdrop-blur">
                <div className="grid min-h-[24rem] min-w-0 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                  <aside className="hidden border-r bg-sidebar p-3 text-sidebar-foreground sm:flex sm:flex-col sm:justify-between">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          <LightbulbIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            Campus Voice
                          </p>
                          <p className="truncate text-[0.65rem] text-muted-foreground">
                            Suggestion system
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs">
                        <p className="px-2 text-[0.65rem] text-muted-foreground">
                          Student
                        </p>
                        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent p-2 font-medium text-sidebar-accent-foreground">
                          <HomeIcon />
                          <span>Overview</span>
                        </div>
                        <div className="flex items-center gap-2 p-2">
                          <SendIcon />
                          <span>Submit</span>
                        </div>
                        <div className="flex items-center gap-2 p-2">
                          <ClipboardListIcon />
                          <span>Feedback</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-t pt-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                        <ShieldCheckIcon />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="truncate font-medium">Maria Santos</p>
                        <p className="truncate text-[0.65rem] text-muted-foreground">
                          maria.santos@student
                        </p>
                      </div>
                    </div>
                  </aside>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3 border-b px-4 py-3">
                      <HomeIcon />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          Account overview
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Account, suggestion totals, and next actions
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 p-4">
                      <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {studentPreviewMetrics.map(([label, value, Icon]) => (
                          <div key={label} className="min-w-0 rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-muted-foreground">
                                {label}
                              </p>
                              {Icon ? (
                                <Icon className="shrink-0 text-muted-foreground" />
                              ) : null}
                            </div>
                            <p className="mt-5 text-2xl font-semibold leading-none">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid min-w-0 gap-3">
                        <div className="min-w-0 rounded-lg border p-4">
                          <p className="text-sm font-semibold">
                            Student account
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Your signed-in email account for campus suggestions.
                          </p>
                          <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                              <MailIcon />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                Maria Santos
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                maria.santos@student.example.com
                              </p>
                              <p className="truncate text-[0.7rem] text-muted-foreground">
                                Computer Studies Department
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                              <SendIcon />
                              Submit feedback
                            </div>
                            <div className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium">
                              <ClipboardListIcon />
                              Track suggestions
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-lg border p-4">
                          <p className="text-sm font-semibold">Recent status</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Track updates on submitted feedback and suggestions.
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            {studentPreviewStatuses.map(
                              ([title, category, status]) => (
                                <div
                                  key={title}
                                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">
                                      {title}
                                    </p>
                                    <p className="truncate text-[0.7rem] text-muted-foreground">
                                      {category} - May 14, 2026
                                    </p>
                                  </div>
                                  <span className="w-fit rounded-lg bg-secondary px-2.5 py-1 text-[0.65rem] font-medium text-secondary-foreground">
                                    {status}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 md:grid-cols-3 md:px-8">
          {workflow.map((item) => (
            <div key={item.title} className="flex gap-3 rounded-lg bg-background p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Creators</h2>
            <p className="text-sm text-muted-foreground">
              Project creators behind Campus Voice.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheckIcon />
            Campus feedback and management system
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((creator, index) => (
            <Card key={creator}>
              <CardHeader className="gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UserRoundIcon />
                </div>
                <CardTitle className="text-base leading-6">{creator}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Creator {index + 1}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
