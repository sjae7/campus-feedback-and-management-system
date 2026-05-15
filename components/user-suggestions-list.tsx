import { FileTextIcon, InboxIcon, UsersIcon } from "lucide-react"

import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
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
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { formatBytes, formatDateTime } from "@/lib/format"
import type { Suggestion } from "@/lib/types"

export function UserSuggestionsList({
  suggestions,
}: {
  suggestions: Suggestion[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My feedback and suggestions</CardTitle>
        <CardDescription>
          Track admin status updates and teacher support on every submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No suggestions yet</EmptyTitle>
              <EmptyDescription>
                Submitted suggestions will appear here with their current status.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {suggestions.map((suggestion) => {
              const supportCount = suggestion.teacher_support_count ?? 0
              const supportLabel =
                supportCount === 1
                  ? "1 teacher supports this suggestion"
                  : `${supportCount} teachers support this suggestion`
              const supporterNames =
                suggestion.teacher_supports
                  ?.map((support) => support.teacher_name)
                  .filter(Boolean)
                  .join(", ") ?? ""

              return (
                <article
                  key={suggestion.id}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.category} -{" "}
                        {formatDateTime(suggestion.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={suggestion.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {suggestion.message}
                  </p>
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <Badge variant={supportCount > 0 ? "default" : "secondary"}>
                      <UsersIcon data-icon="inline-start" />
                      {supportLabel}
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {supportCount > 0
                        ? supporterNames
                          ? `Supported by ${supporterNames}.`
                          : "Teachers from your department have supported this suggestion."
                        : "No teacher has supported this suggestion yet."}
                    </p>
                  </div>
                  {suggestion.status === "rejected" &&
                  suggestion.rejection_reason ? (
                    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-sm font-medium text-destructive">
                        Rejection reason
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {suggestion.rejection_reason}
                      </p>
                    </div>
                  ) : null}
                  {suggestion.suggestion_attachments?.length ? (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-col gap-2">
                        {suggestion.suggestion_attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.signedUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <FileTextIcon />
                            <span className="truncate">
                              {attachment.file_name}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                              {formatBytes(attachment.size)}
                            </span>
                          </a>
                        ))}
                      </div>
                    </>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
