"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, SearchIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { toggleTeacherSupport } from "@/app/actions/suggestions"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime } from "@/lib/format"
import { statusLabels } from "@/components/status-badge"
import type { AdminSuggestion, SuggestionStatus } from "@/lib/types"

type TeacherFeedbackListProps = {
  suggestions: AdminSuggestion[]
}

export function TeacherFeedbackList({ suggestions }: TeacherFeedbackListProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">(
    "all"
  )
  const [supportFilter, setSupportFilter] = useState<
    "all" | "supported-by-me" | "supported" | "unsupported"
  >("all")
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "most-support" | "title"
  >("newest")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = suggestions.filter((suggestion) => {
      const supportCount = suggestion.teacher_support_count ?? 0
      const searchable = [
        suggestion.title,
        suggestion.message,
        suggestion.category,
        suggestion.students?.full_name ?? "",
        suggestion.students?.department_name ?? "",
      ]
        .join(" ")
        .toLowerCase()

      const matchesStatus =
        statusFilter === "all" || suggestion.status === statusFilter
      const matchesSupport =
        supportFilter === "all" ||
        (supportFilter === "supported-by-me" && suggestion.teacher_supported) ||
        (supportFilter === "supported" && supportCount > 0) ||
        (supportFilter === "unsupported" && supportCount === 0)

      return (
        matchesStatus &&
        matchesSupport &&
        searchable.includes(normalizedQuery)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortOrder === "oldest") {
        return Date.parse(a.created_at) - Date.parse(b.created_at)
      }

      if (sortOrder === "most-support") {
        return (
          (b.teacher_support_count ?? 0) - (a.teacher_support_count ?? 0) ||
          Date.parse(b.created_at) - Date.parse(a.created_at)
        )
      }

      if (sortOrder === "title") {
        return a.title.localeCompare(b.title)
      }

      return Date.parse(b.created_at) - Date.parse(a.created_at)
    })
  }, [query, sortOrder, statusFilter, suggestions, supportFilter])

  function handleSupport(suggestionId: string) {
    setPendingId(suggestionId)
    startTransition(async () => {
      const result = await toggleTeacherSupport(suggestionId)
      setPendingId(null)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message ?? "Support could not be updated.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student feedback</CardTitle>
        <CardDescription>
          Review student submissions and support items that need attention.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {suggestions.length === 0 ? (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyTitle>No student feedback yet</EmptyTitle>
              <EmptyDescription>
                Student submissions will appear here for teacher support.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-sm">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search student feedback"
                  className="pl-8"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:flex">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as SuggestionStatus | "all")
                  }
                >
                  <SelectTrigger className="w-full xl:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All statuses</SelectItem>
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <SelectItem key={status} value={status}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={supportFilter}
                  onValueChange={(value) =>
                    setSupportFilter(
                      value as
                        | "all"
                        | "supported-by-me"
                        | "supported"
                        | "unsupported"
                    )
                  }
                >
                  <SelectTrigger className="w-full xl:w-48">
                    <SelectValue placeholder="Support" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All feedback</SelectItem>
                      <SelectItem value="supported-by-me">
                        Supported by me
                      </SelectItem>
                      <SelectItem value="supported">Any support</SelectItem>
                      <SelectItem value="unsupported">No support yet</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={sortOrder}
                  onValueChange={(value) =>
                    setSortOrder(
                      value as "newest" | "oldest" | "most-support" | "title"
                    )
                  }
                >
                  <SelectTrigger className="w-full xl:w-44">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="most-support">
                        Most support
                      </SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredSuggestions.length} of {suggestions.length}{" "}
              student feedback items.
            </div>
            {filteredSuggestions.length === 0 ? (
              <Empty className="min-h-52 rounded-lg border border-dashed">
                <EmptyHeader>
                  <EmptyTitle>No matching feedback</EmptyTitle>
                  <EmptyDescription>
                    Adjust the search or filters to show more student feedback.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
            {filteredSuggestions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredSuggestions.map((suggestion) => {
                  const supportCount = suggestion.teacher_support_count ?? 0
                  const isSupported = Boolean(suggestion.teacher_supported)
                  const isUpdating = isPending && pendingId === suggestion.id

                  return (
                    <article
                      key={suggestion.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">
                              {suggestion.title}
                            </h3>
                            <StatusBadge status={suggestion.status} />
                            <Badge variant="secondary">
                              <UsersIcon data-icon="inline-start" />
                              {supportCount} teacher
                              {supportCount === 1 ? "" : "s"} supported
                            </Badge>
                            {isSupported ? (
                              <Badge variant="outline">Supported by you</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {suggestion.category} -{" "}
                            {formatDateTime(suggestion.created_at)}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            From{" "}
                            {suggestion.students?.full_name ??
                              "Unknown student"}{" "}
                            -{" "}
                            {suggestion.students?.department_name ??
                              "No department on profile"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {suggestion.message}
                      </p>
                      <div className="mt-4 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            Teacher support
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isSupported
                              ? "You are supporting this student suggestion."
                              : "Support this suggestion if it should be prioritized by admins."}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={isSupported ? "secondary" : "default"}
                          disabled={isUpdating}
                          onClick={() => handleSupport(suggestion.id)}
                        >
                          <CheckCircle2Icon data-icon="inline-start" />
                          {isSupported
                            ? "Remove support"
                            : "Support this suggestion"}
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
