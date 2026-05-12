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

type StudentRelation = {
  full_name: string | null
  email: string | null
  department_id: string | null
  departments?: { name: string | null } | { name: string | null }[] | null
}

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
      "id, user_id, title, message, category, status, created_at, updated_at, students(full_name, email, department_id, departments(name)), suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .order("created_at", { ascending: false })

  const suggestions = ((data ?? []) as Array<
    Omit<AdminSuggestion, "students"> & {
      students?: StudentRelation | StudentRelation[] | null
    }
  >).map((suggestion) => {
    const student = Array.isArray(suggestion.students)
      ? suggestion.students[0]
      : suggestion.students
    const department = Array.isArray(student?.departments)
      ? student.departments[0]
      : student?.departments

    return {
      ...suggestion,
      students: student
        ? {
            full_name: student.full_name,
            email: student.email,
            department_id: student.department_id,
            department_name: department?.name ?? null,
          }
        : null,
    }
  })

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
      approved: 0,
      resolved: 0,
      rejected: 0,
    }
  )
}

export { ATTACHMENTS_BUCKET }
