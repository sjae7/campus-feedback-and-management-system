import { Badge } from "@/components/ui/badge"
import type { SuggestionStatus } from "@/lib/types"

const statusLabels: Record<SuggestionStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  approved: "Approved",
  resolved: "Approved",
  rejected: "Rejected",
}

const statusVariants: Record<
  SuggestionStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  new: "default",
  reviewing: "secondary",
  approved: "outline",
  resolved: "outline",
  rejected: "destructive",
}

export function StatusBadge({ status }: { status: SuggestionStatus }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
}

export { statusLabels }
