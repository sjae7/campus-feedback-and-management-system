"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireAdmin } from "@/lib/auth"
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { suggestionStatuses, type SuggestionStatus } from "@/lib/types"

export type AdminActionState = {
  message?: string
  success?: boolean
}

const updateStatusSchema = z.object({
  suggestionId: z.uuid(),
  status: z.enum(suggestionStatuses),
})

const createUserSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["user", "admin"]),
})

export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus
): Promise<AdminActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured.",
    }
  }

  const admin = await requireAdmin()

  if (!admin) {
    return {
      message: "Only admins can update suggestion status.",
    }
  }

  const parsed = updateStatusSchema.safeParse({ suggestionId, status })

  if (!parsed.success) {
    return {
      message: "Invalid status update.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("suggestions")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.suggestionId)

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath("/admin")

  return {
    success: true,
    message: "Status updated.",
  }
}

export async function createManagedUser(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured.",
    }
  }

  if (!hasSupabaseAdminEnv()) {
    return {
      message:
        "SUPABASE_SERVICE_ROLE_KEY is required before admins can create accounts.",
    }
  }

  const admin = await requireAdmin()

  if (!admin) {
    return {
      message: "Only admins can create accounts.",
    }
  }

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "user",
  })

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Invalid account details.",
    }
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  })

  if (error || !data.user) {
    return {
      message: error?.message ?? "User could not be created.",
    }
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
  })

  if (profileError) {
    return {
      message: `Auth account created, but profile setup failed: ${profileError.message}`,
    }
  }

  revalidatePath("/admin")

  return {
    success: true,
    message: `${parsed.data.role === "admin" ? "Admin" : "User"} account created.`,
  }
}
