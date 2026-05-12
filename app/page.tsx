import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  FileTextIcon,
  InboxIcon,
  LightbulbIcon,
  ShieldCheckIcon,
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

            <div className="relative">
              <div className="rounded-lg border bg-background/95 p-3 shadow-xl shadow-primary/10 backdrop-blur">
                <div className="flex items-center justify-between border-b px-2 pb-3">
                  <div>
                    <p className="text-sm font-medium">Admin inbox</p>
                    <p className="text-xs text-muted-foreground">
                      Review campus feedback
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                      Approved
                    </span>
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      Reviewing
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 pt-3 md:grid-cols-[1fr_15rem]">
                  <div className="flex flex-col gap-3">
                    {[
                      ["Library tables", "Facilities", "Approved"],
                      ["Campus Wi-Fi", "Technology", "Reviewing"],
                      ["Clinic queue", "Student Services", "New"],
                    ].map(([title, category, status]) => (
                      <div
                        key={title}
                        className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{title}</p>
                          <p className="text-xs text-muted-foreground">
                            {category}
                          </p>
                        </div>
                        <span className="w-fit rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-muted/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FileTextIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Attachment review</p>
                        <p className="text-xs text-muted-foreground">
                          View or download files
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-2">
                      <div className="h-2 rounded-full bg-primary/30" />
                      <div className="h-2 w-4/5 rounded-full bg-secondary/40" />
                      <div className="h-2 w-3/5 rounded-full bg-primary/20" />
                    </div>
                    <div className="mt-6 rounded-lg border bg-background p-3">
                      <p className="text-xs font-medium">Student visibility</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Status updates appear in My feedback and suggestions.
                      </p>
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
