"use client"

import { useActionState, useEffect, useRef } from "react"
import { SendIcon } from "lucide-react"
import { toast } from "sonner"

import {
  createSuggestion,
  type SuggestionActionState,
} from "@/app/actions/suggestions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { suggestionCategories } from "@/lib/types"

const initialState: SuggestionActionState = {}

export function SuggestionForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    createSuggestion,
    initialState
  )

  useEffect(() => {
    if (!state.message) {
      return
    }

    if (state.success) {
      toast.success(state.message)
      formRef.current?.reset()
    } else {
      toast.error(state.message)
    }
  }, [state.message, state.success])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a suggestion</CardTitle>
        <CardDescription>
          Share one clear idea, issue, or improvement for campus review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction}>
          <FieldGroup>
            <Field data-invalid={Boolean(state.errors?.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="Example: Add shaded study tables near the library"
                aria-invalid={Boolean(state.errors?.title)}
                disabled={pending}
              />
              <FieldError
                errors={state.errors?.title?.map((message) => ({ message }))}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors?.category)}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Select name="category" disabled={pending}>
                <SelectTrigger
                  id="category"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.category)}
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {suggestionCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError
                errors={state.errors?.category?.map((message) => ({ message }))}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors?.message)}>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe the suggestion, why it matters, and where it applies."
                className="min-h-32"
                aria-invalid={Boolean(state.errors?.message)}
                disabled={pending}
              />
              <FieldError
                errors={state.errors?.message?.map((message) => ({ message }))}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors?.attachment)}>
              <FieldLabel htmlFor="attachment">Attachment</FieldLabel>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                disabled={pending}
              />
              <FieldDescription>
                Optional image or document, up to 10 MB.
              </FieldDescription>
              <FieldError
                errors={state.errors?.attachment?.map((message) => ({ message }))}
              />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SendIcon data-icon="inline-start" />
              )}
              Submit suggestion
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
