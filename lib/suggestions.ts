import "server-only"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import type {
  AdminSuggestion,
  Suggestion,
  SuggestionAttachment,
  SuggestionStatus,
} from "@/lib/types"

const ATTACHMENTS_BUCKET = "suggestion-attachments"
const SIGNED_URL_TTL = 60 * 10

async function attachSignedUrls<T extends { suggestion_attachments?: SuggestionAttachment[] }>(
  rows: T[]
) {
  if (!rows.length) {
    return rows
  }

  const supabase = await createClient()

  return Promise.all(
    rows.map(async (row) => {
      const attachments = row.suggestion_attachments ?? []
      const signedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const { data } = await supabase.storage
            .from(attachment.bucket || ATTACHMENTS_BUCKET)
            .createSignedUrl(attachment.path, SIGNED_URL_TTL)

          return {
            ...attachment,
            signedUrl: data?.signedUrl ?? null,
          }
        })
      )

      return {
        ...row,
        suggestion_attachments: signedAttachments,
      }
    })
  )
}

export async function getUserSuggestions(userId: string) {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("suggestions")
    .select(
      "id, user_id, title, message, category, status, created_at, updated_at, suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return attachSignedUrls((data ?? []) as Suggestion[])
}

export async function getAdminSuggestions() {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("suggestions")
    .select(
      "id, user_id, title, message, category, status, created_at, updated_at, profiles(full_name, role), suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .order("created_at", { ascending: false })

  const suggestions = (data ?? []).map((suggestion) => ({
    ...suggestion,
    profiles: Array.isArray(suggestion.profiles)
      ? suggestion.profiles[0] ?? null
      : suggestion.profiles ?? null,
  }))

  return attachSignedUrls(suggestions as unknown as AdminSuggestion[])
}

export function getStatusCounts(suggestions: { status: SuggestionStatus }[]) {
  return suggestions.reduce(
    (counts, suggestion) => {
      counts[suggestion.status] += 1
      counts.total += 1
      return counts
    },
    {
      total: 0,
      new: 0,
      reviewing: 0,
      resolved: 0,
      rejected: 0,
    }
  )
}

export { ATTACHMENTS_BUCKET }
