"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  createManagedUser,
  type AdminActionState,
} from "@/app/actions/admin"
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
import { departments } from "@/lib/types"

const initialState: AdminActionState = {}

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [role, setRole] = useState<"student" | "admin">("student")
  const [state, formAction, pending] = useActionState(
    createManagedUser,
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
        <CardTitle>Create email account</CardTitle>
        <CardDescription>
          Add a student or admin account with an email and temporary password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input id="fullName" name="fullName" disabled={pending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Temporary password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                disabled={pending}
              />
              <FieldDescription>
                Use at least 8 characters. Share it outside the app.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                name="role"
                value={role}
                onValueChange={(value) => setRole(value as "student" | "admin")}
                disabled={pending}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {role === "student" ? (
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Select name="department" disabled={pending}>
                  <SelectTrigger id="department" className="w-full">
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
              </Field>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <UserPlusIcon data-icon="inline-start" />
              )}
              Create account
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
