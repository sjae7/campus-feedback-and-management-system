"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { departmentIds } from "@/lib/types"

export type AuthActionState = {
  message?: string
  errors?: {
    fullName?: string[]
    role?: string[]
    department?: string[]
    email?: string[]
    password?: string[]
  }
}

const emailPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const signupSchema = emailPasswordSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  role: z.enum(["student", "teacher"], {
    error: "Choose whether this is a student or teacher account.",
  }),
  department: z.enum(departmentIds, {
    error: "Choose a department.",
  }),
})

export async function login(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured. Add your environment variables first.",
    }
  }

  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath("/", "layout")
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: admin } = user
    ? await supabase.from("admins").select("id").eq("id", user.id).maybeSingle()
    : { data: null }

  redirect(admin ? "/admin" : "/dashboard")
}

export async function signup(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured. Add your environment variables first.",
    }
  }

  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    role: formData.get("role") ?? "student",
    department: formData.get("department"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
        department_id: parsed.data.department,
      },
    },
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  if (data.user) {
    const profileTable =
      parsed.data.role === "teacher" ? "teachers" : "students"

    await supabase.from(profileTable).upsert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      department_id: parsed.data.department,
    })
  }

  if (!data.session) {
    return {
      message:
        "Account created. Check your email to confirm your account before signing in.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  revalidatePath("/", "layout")
  redirect("/login")
}
