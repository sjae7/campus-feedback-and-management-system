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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
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
  rejectionReason?: string | null
}

export function AdminSuggestionStatusSelect({
  suggestionId,
  status,
  rejectionReason,
}: AdminSuggestionStatusSelectProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [draftReason, setDraftReason] = useState(rejectionReason ?? "")
  const [isPending, startTransition] = useTransition()
  const isUpdating = isPending && pendingId === suggestionId

  function handleStatusChange(
    nextStatus: SuggestionStatus,
    nextRejectionReason?: string
  ) {
    if (nextStatus === "rejected" && !nextRejectionReason?.trim()) {
      setDraftReason(rejectionReason ?? "")
      setRejectDialogOpen(true)
      return
    }

    setPendingId(suggestionId)
    startTransition(async () => {
      const result = await updateSuggestionStatus(
        suggestionId,
        nextStatus,
        nextRejectionReason
      )
      setPendingId(null)

      if (result.success) {
        toast.success(result.message)
        setRejectDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.message ?? "Status could not be updated.")
      }
    })
  }

  return (
    <>
      <Select
        value={status === "resolved" ? "approved" : status}
        disabled={isUpdating}
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
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject suggestion</DialogTitle>
            <DialogDescription>
              Enter the reason the submitter will see for this rejection.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`rejection-reason-${suggestionId}`}>
                Rejection reason
              </FieldLabel>
              <Textarea
                id={`rejection-reason-${suggestionId}`}
                value={draftReason}
                onChange={(event) => setDraftReason(event.target.value)}
                placeholder="Explain why this suggestion or feedback is rejected."
                disabled={isUpdating}
              />
              <FieldDescription>
                This message is visible in the submitter&apos;s suggestion list.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isUpdating || draftReason.trim().length < 5}
              onClick={() => handleStatusChange("rejected", draftReason)}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { adminStatusOptions }
