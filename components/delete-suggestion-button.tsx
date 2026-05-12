"use client"

import { useState, useTransition } from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteSuggestion } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type DeleteSuggestionButtonProps = {
  suggestionId: string
  redirectToInbox?: boolean
}

export function DeleteSuggestionButton({
  suggestionId,
  redirectToInbox = false,
}: DeleteSuggestionButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      const result = await deleteSuggestion(suggestionId, redirectToInbox)

      if (result?.success) {
        toast.success(result.message)
        setConfirming(false)
      } else if (result?.message) {
        toast.error(result.message)
      }
    })
  }

  return (
    <Button
      type="button"
      variant={confirming ? "destructive" : "outline"}
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Trash2Icon data-icon="inline-start" />
      )}
      {confirming ? "Confirm delete" : "Delete"}
    </Button>
  )
}
