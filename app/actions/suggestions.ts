"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireStudent } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { ATTACHMENTS_BUCKET } from "@/lib/suggestions"
import { suggestionCategories } from "@/lib/types"

export type SuggestionActionState = {
  message?: string
  success?: boolean
  errors?: {
    title?: string[]
    category?: string[]
    message?: string[]
    attachment?: string[]
  }
}

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024

const suggestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(120),
  category: z.enum(suggestionCategories, {
    error: "Choose a category.",
  }),
  message: z.string().min(15, "Message must be at least 15 characters.").max(3000),
})

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

export async function createSuggestion(
  _previousState: SuggestionActionState,
  formData: FormData
): Promise<SuggestionActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured. Add your environment variables first.",
    }
  }

  const user = await requireStudent()

  if (!user) {
    return {
      message: "You must be signed in as a student to submit feedback.",
    }
  }

  const parsed = suggestionSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    message: formData.get("message"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const attachment = formData.get("attachment")

  if (attachment instanceof File && attachment.size > MAX_ATTACHMENT_SIZE) {
    return {
      errors: {
        attachment: ["Attachment must be 10 MB or smaller."],
      },
    }
  }

  const supabase = await createClient()
  const { data: suggestion, error: suggestionError } = await supabase
    .from("suggestions")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      category: parsed.data.category,
      message: parsed.data.message,
      status: "new",
    })
    .select("id")
    .single()

  if (suggestionError || !suggestion) {
    return {
      message: suggestionError?.message ?? "Suggestion could not be created.",
    }
  }

  if (attachment instanceof File && attachment.size > 0) {
    const safeName = sanitizeFileName(attachment.name || "attachment")
    const path = `${user.id}/${suggestion.id}/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, attachment, {
        contentType: attachment.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      return {
        message: `Suggestion saved, but the attachment upload failed: ${uploadError.message}`,
      }
    }

    const { error: metadataError } = await supabase
      .from("suggestion_attachments")
      .insert({
        suggestion_id: suggestion.id,
        user_id: user.id,
        bucket: ATTACHMENTS_BUCKET,
        path,
        file_name: attachment.name || safeName,
        mime_type: attachment.type || null,
        size: attachment.size,
      })

    if (metadataError) {
      return {
        message: `Suggestion saved, but attachment metadata failed: ${metadataError.message}`,
      }
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/suggestions")

  return {
    success: true,
    message: "Suggestion submitted.",
  }
}
