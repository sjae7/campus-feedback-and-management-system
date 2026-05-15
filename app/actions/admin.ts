"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireAdmin } from "@/lib/auth"
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ATTACHMENTS_BUCKET } from "@/lib/suggestions"
import {
  departmentIds,
  suggestionStatuses,
  type SuggestionStatus,
} from "@/lib/types"

export type AdminActionState = {
  message?: string
  success?: boolean
}

const updateStatusSchema = z.object({
  suggestionId: z.uuid(),
  status: z.enum(suggestionStatuses),
  rejectionReason: z.string().trim().max(1000).optional(),
}).refine(
  (value) =>
    value.status !== "rejected" ||
    Boolean(value.rejectionReason && value.rejectionReason.length >= 5),
  {
    message: "Enter a rejection reason with at least 5 characters.",
    path: ["rejectionReason"],
  }
)

const suggestionIdSchema = z.uuid()

const createUserSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["student", "teacher", "admin"]),
  department: z.enum(departmentIds).optional(),
}).refine(
  (value) => value.role === "admin" || Boolean(value.department),
  {
    message: "Choose a department for student and teacher accounts.",
    path: ["department"],
  }
)

export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus,
  rejectionReason?: string
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

  const parsed = updateStatusSchema.safeParse({
    suggestionId,
    status,
    rejectionReason,
  })

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
      rejection_reason:
        parsed.data.status === "rejected"
          ? parsed.data.rejectionReason
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.suggestionId)

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/suggestions")
  revalidatePath(`/admin/suggestions/${parsed.data.suggestionId}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/suggestions")

  return {
    success: true,
    message: "Status updated.",
  }
}

export async function deleteSuggestion(
  suggestionId: string,
  redirectToInbox = false
): Promise<AdminActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured.",
    }
  }

  if (!hasSupabaseAdminEnv()) {
    return {
      message: "SUPABASE_SERVICE_ROLE_KEY is required before deleting suggestions.",
    }
  }

  const admin = await requireAdmin()

  if (!admin) {
    return {
      message: "Only admins can delete suggestions.",
    }
  }

  const parsed = suggestionIdSchema.safeParse(suggestionId)

  if (!parsed.success) {
    return {
      message: "Invalid suggestion.",
    }
  }

  const supabaseAdmin = createAdminClient()
  const { data: attachments, error: attachmentsError } = await supabaseAdmin
    .from("suggestion_attachments")
    .select("bucket, path")
    .eq("suggestion_id", parsed.data)

  if (attachmentsError) {
    return {
      message: attachmentsError.message,
    }
  }

  const attachmentsByBucket = new Map<string, string[]>()

  for (const attachment of attachments ?? []) {
    const bucket = attachment.bucket || ATTACHMENTS_BUCKET
    const paths = attachmentsByBucket.get(bucket) ?? []
    paths.push(attachment.path)
    attachmentsByBucket.set(bucket, paths)
  }

  for (const [bucket, paths] of attachmentsByBucket.entries()) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths)

    if (storageError) {
      return {
        message: storageError.message,
      }
    }
  }

  const { error } = await supabaseAdmin
    .from("suggestions")
    .delete()
    .eq("id", parsed.data)

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/suggestions")
  revalidatePath(`/admin/suggestions/${parsed.data}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/suggestions")

  if (redirectToInbox) {
    redirect("/admin/suggestions")
  }

  return {
    success: true,
    message: "Suggestion deleted.",
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
    role: formData.get("role") ?? "student",
    department: formData.get("department") || undefined,
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
      role: parsed.data.role,
      department_id: parsed.data.department,
    },
  })

  if (error || !data.user) {
    return {
      message: error?.message ?? "User could not be created.",
    }
  }

  const { error: profileError } =
    parsed.data.role === "admin"
      ? await supabaseAdmin.from("admins").upsert({
          id: data.user.id,
          full_name: parsed.data.fullName,
          email: parsed.data.email,
        })
      : await supabaseAdmin
          .from(parsed.data.role === "teacher" ? "teachers" : "students")
          .upsert({
            id: data.user.id,
            full_name: parsed.data.fullName,
            email: parsed.data.email,
            department_id: parsed.data.department,
          })

  if (profileError) {
    return {
      message: `Auth account created, but account table setup failed: ${profileError.message}`,
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/users")

  return {
    success: true,
    message: `${parsed.data.role[0].toUpperCase()}${parsed.data.role.slice(
      1
    )} account created.`,
  }
}
