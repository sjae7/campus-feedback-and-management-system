"use client"

import { useMemo, useState, useTransition } from "react"
import { FileTextIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateSuggestionStatus } from "@/app/actions/admin"
import { StatusBadge, statusLabels } from "@/components/status-badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatBytes, formatDateTime } from "@/lib/format"
import {
  suggestionStatuses,
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
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return suggestions.filter((suggestion) => {
      const matchesStatus =
        statusFilter === "all" || suggestion.status === statusFilter
      const searchable = [
        suggestion.title,
        suggestion.message,
        suggestion.category,
        suggestion.profiles?.full_name ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [query, statusFilter, suggestions])

  function handleStatusChange(id: string, status: SuggestionStatus) {
    setPendingId(id)
    startTransition(async () => {
      const result = await updateSuggestionStatus(id, status)
      setPendingId(null)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message ?? "Status could not be updated.")
      }
    })
  }

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
              {suggestionStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Suggestion</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead className="text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuggestions.map((suggestion) => (
              <TableRow key={suggestion.id}>
                <TableCell className="min-w-80 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{suggestion.title}</span>
                      <StatusBadge status={suggestion.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.category}
                    </span>
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {suggestion.message}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {suggestion.profiles?.full_name ?? "Unknown user"}
                </TableCell>
                <TableCell className="align-top">
                  <Select
                    value={suggestion.status}
                    disabled={isPending && pendingId === suggestion.id}
                    onValueChange={(value) =>
                      handleStatusChange(suggestion.id, value as SuggestionStatus)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {suggestionStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1">
                    {suggestion.suggestion_attachments?.length ? (
                      suggestion.suggestion_attachments.map((attachment) => (
                        <Button
                          key={attachment.id}
                          asChild
                          variant="link"
                          className="h-auto justify-start p-0"
                        >
                          <a
                            href={attachment.signedUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileTextIcon data-icon="inline-start" />
                            {attachment.file_name}
                            <span className="text-muted-foreground">
                              {formatBytes(attachment.size)}
                            </span>
                          </a>
                        </Button>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right align-top text-sm text-muted-foreground">
                  {formatDateTime(suggestion.created_at)}
                </TableCell>
              </TableRow>
            ))}
            {filteredSuggestions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No suggestions match the current filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
