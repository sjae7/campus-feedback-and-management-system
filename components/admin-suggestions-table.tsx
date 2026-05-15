"use client"

import { useMemo, useState } from "react"
import { FileTextIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  AdminSuggestionStatusSelect,
  adminStatusOptions,
} from "@/components/admin-suggestion-status-select"
import { DeleteSuggestionButton } from "@/components/delete-suggestion-button"
import { StatusBadge, statusLabels } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBytes, formatDateTime } from "@/lib/format"
import {
  type AdminSuggestion,
  type SuggestionStatus,
} from "@/lib/types"

export function AdminSuggestionsTable({
  suggestions,
}: {
  suggestions: AdminSuggestion[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">(
    "all"
  )
  const [supportFilter, setSupportFilter] = useState<
    "all" | "supported" | "unsupported"
  >("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "teacher-support">(
    "newest"
  )

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = suggestions.filter((suggestion) => {
      const supportCount = suggestion.teacher_support_count ?? 0
      const matchesStatus =
        statusFilter === "all" ||
        suggestion.status === statusFilter ||
        (statusFilter === "approved" && suggestion.status === "resolved")
      const matchesSupport =
        supportFilter === "all" ||
        (supportFilter === "supported" && supportCount > 0) ||
        (supportFilter === "unsupported" && supportCount === 0)
      const searchable = [
        suggestion.title,
        suggestion.message,
        suggestion.category,
        suggestion.rejection_reason ?? "",
        suggestion.students?.full_name ?? "",
        suggestion.students?.email ?? "",
        suggestion.students?.department_name ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return (
        matchesStatus &&
        matchesSupport &&
        searchable.includes(normalizedQuery)
      )
    })

    if (sortOrder === "teacher-support") {
      return [...filtered].sort(
        (a, b) =>
          (b.teacher_support_count ?? 0) - (a.teacher_support_count ?? 0) ||
          Date.parse(b.created_at) - Date.parse(a.created_at)
      )
    }

    return filtered
  }, [query, sortOrder, statusFilter, suggestions, supportFilter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search suggestions"
            className="pl-8"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:flex">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as SuggestionStatus | "all")
            }
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                {adminStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={supportFilter}
            onValueChange={(value) =>
              setSupportFilter(value as "all" | "supported" | "unsupported")
            }
          >
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Teacher support" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All support</SelectItem>
                <SelectItem value="supported">Supported</SelectItem>
                <SelectItem value="unsupported">Unsupported</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) =>
              setSortOrder(value as "newest" | "teacher-support")
            }
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="teacher-support">
                  Most teacher support
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredSuggestions.length} of {suggestions.length}{" "}
        suggestions.
      </div>
      {filteredSuggestions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No suggestions match the current filters.
        </div>
      ) : (
        <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border">
          {filteredSuggestions.map((suggestion) => (
            <article
              key={suggestion.id}
              role="link"
              tabIndex={0}
              className="grid min-w-0 cursor-pointer gap-4 border-b p-4 last:border-b-0 hover:bg-muted/50 xl:grid-cols-[minmax(0,1fr)_16rem]"
              onClick={() => router.push(`/admin/suggestions/${suggestion.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  router.push(`/admin/suggestions/${suggestion.id}`)
                }
              }}
            >
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="min-w-0 font-medium">{suggestion.title}</h3>
                  <StatusBadge status={suggestion.status} />
                  <Badge variant="secondary">
                    {suggestion.teacher_support_count ?? 0} supported
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {suggestion.category} - {formatDateTime(suggestion.created_at)}
                </p>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {suggestion.message}
                </p>
                {suggestion.status === "rejected" &&
                suggestion.rejection_reason ? (
                  <p className="line-clamp-2 text-sm leading-6 text-destructive">
                    Reason: {suggestion.rejection_reason}
                  </p>
                ) : null}
                <div
                  className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                  onClick={(event) => event.stopPropagation()}
                >
                  <AdminSuggestionStatusSelect
                    suggestionId={suggestion.id}
                    status={suggestion.status}
                    rejectionReason={suggestion.rejection_reason}
                  />
                  <DeleteSuggestionButton suggestionId={suggestion.id} />
                </div>
              </div>
              <div className="min-w-0 rounded-lg bg-muted/30 p-3 text-sm xl:bg-transparent xl:p-0">
                <p className="font-medium">
                  {suggestion.students?.full_name ?? "Unknown submitter"}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {suggestion.students?.role ?? "Unknown role"}
                </p>
                <p className="truncate text-muted-foreground">
                  {suggestion.students?.email ?? "No email on profile"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {suggestion.students?.department_name ??
                    "No department on profile"}
                </p>
                <div
                  className="mt-3 flex min-w-0 flex-col gap-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  {suggestion.suggestion_attachments?.length ? (
                    suggestion.suggestion_attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        asChild
                        variant="link"
                        className="h-auto min-w-0 justify-start p-0"
                      >
                        <a
                          href={attachment.signedUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileTextIcon data-icon="inline-start" />
                          <span className="truncate">
                            {attachment.file_name}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {formatBytes(attachment.size)}
                          </span>
                        </a>
                      </Button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No attachments
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
