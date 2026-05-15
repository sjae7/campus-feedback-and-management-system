"use client"

import { useActionState, useEffect } from "react"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type ProfileActionState,
  updateProfile,
} from "@/app/actions/profile"
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
import { departments, type Profile } from "@/lib/types"

const initialState: ProfileActionState = {}

type ProfileSettingsFormProps = {
  profile: Profile
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  )

  useEffect(() => {
    if (!state.message) {
      return
    }

    if (state.success) {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state.message, state.success])

  const departmentLabel =
    profile.role === "teacher"
      ? "Department belonged to"
      : "Department enrolled to"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account settings</CardTitle>
        <CardDescription>
          Update the name and department shown on your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={Boolean(state.errors?.fullName)}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile.full_name ?? ""}
                disabled={pending}
                aria-invalid={Boolean(state.errors?.fullName)}
              />
              <FieldError
                errors={state.errors?.fullName?.map((message) => ({
                  message,
                }))}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors?.department)}>
              <FieldLabel htmlFor="department">{departmentLabel}</FieldLabel>
              <Select
                name="department"
                defaultValue={profile.department_id ?? undefined}
                disabled={pending}
              >
                <SelectTrigger
                  id="department"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.department)}
                >
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError
                errors={state.errors?.department?.map((message) => ({
                  message,
                }))}
              />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              Save changes
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
