"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateSuggestionStatus } from "@/app/actions/admin"
import { statusLabels } from "@/components/status-badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  suggestionStatuses,
  type SuggestionStatus,
} from "@/lib/types"

const adminStatusOptions = suggestionStatuses.filter(
  (status) => status !== "resolved"
)

type AdminSuggestionStatusSelectProps = {
  suggestionId: string
  status: SuggestionStatus
}

export function AdminSuggestionStatusSelect({
  suggestionId,
  status,
}: AdminSuggestionStatusSelectProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(nextStatus: SuggestionStatus) {
    setPendingId(suggestionId)
    startTransition(async () => {
      const result = await updateSuggestionStatus(suggestionId, nextStatus)
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
    <Select
      value={status === "resolved" ? "approved" : status}
      disabled={isPending && pendingId === suggestionId}
      onValueChange={(value) =>
        handleStatusChange(value as SuggestionStatus)
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {adminStatusOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {statusLabels[option]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { adminStatusOptions }
