"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { ArrowRightIcon, LogInIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type AuthActionState,
  login,
  signup,
} from "@/app/actions/auth"
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
import { Spinner } from "@/components/ui/spinner"

const initialState: AuthActionState = {}

type AuthFormProps = {
  mode: "login" | "signup"
  isConfigured: boolean
}

export function AuthForm({ mode, isConfigured }: AuthFormProps) {
  const action = mode === "login" ? login : signup
  const [state, formAction, pending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)
    }
  }, [state.message])

  const isLogin = mode === "login"

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Sign in" : "Create account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Use your campus account to submit and track suggestions."
            : "Create an account before submitting campus suggestions."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {!isLogin ? (
              <Field data-invalid={Boolean(state.errors?.fullName)}>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  aria-invalid={Boolean(state.errors?.fullName)}
                  disabled={!isConfigured || pending}
                />
                <FieldError
                  errors={state.errors?.fullName?.map((message) => ({ message }))}
                />
              </Field>
            ) : null}
            <Field data-invalid={Boolean(state.errors?.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(state.errors?.email)}
                disabled={!isConfigured || pending}
              />
              <FieldError
                errors={state.errors?.email?.map((message) => ({ message }))}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors?.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-invalid={Boolean(state.errors?.password)}
                disabled={!isConfigured || pending}
              />
              <FieldDescription>
                Passwords must be at least 8 characters.
              </FieldDescription>
              <FieldError
                errors={state.errors?.password?.map((message) => ({ message }))}
              />
            </Field>
            {state.message ? <FieldError>{state.message}</FieldError> : null}
            <Button type="submit" disabled={!isConfigured || pending}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : isLogin ? (
                <LogInIcon data-icon="inline-start" />
              ) : (
                <UserPlusIcon data-icon="inline-start" />
              )}
              {isLogin ? "Sign in" : "Create account"}
            </Button>
            <Button asChild variant="ghost">
              <Link href={isLogin ? "/signup" : "/login"}>
                {isLogin ? "Need an account?" : "Already have an account?"}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
