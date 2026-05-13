import "server-only"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import type {
  AdminSuggestion,
  DepartmentId,
  Suggestion,
  SuggestionAttachment,
  StatusCounts,
  SuggestionStatus,
} from "@/lib/types"
import { suggestionStatuses } from "@/lib/types"

const ATTACHMENTS_BUCKET = "suggestion-attachments"
const SIGNED_URL_TTL = 60 * 10

type StudentRelation = {
  full_name: string | null
  email: string | null
  department_id: string | null
  departments?: { name: string | null } | { name: string | null }[] | null
}

type AdminSuggestionRow = Omit<AdminSuggestion, "students"> & {
  students?: StudentRelation | StudentRelation[] | null
}

type SuggestionPreview = Pick<
  Suggestion,
  "id" | "title" | "category" | "status" | "created_at"
>

function createEmptyStatusCounts(): StatusCounts {
  return {
    total: 0,
    new: 0,
    reviewing: 0,
    approved: 0,
    resolved: 0,
    rejected: 0,
  }
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

export async function getUserSuggestionDashboard(userId: string): Promise<{
  counts: StatusCounts
  recentSuggestions: SuggestionPreview[]
}> {
  const emptyDashboard = {
    counts: createEmptyStatusCounts(),
    recentSuggestions: [],
  }

  if (!hasSupabaseEnv()) {
    return emptyDashboard
  }

  const supabase = await createClient()
  const countStatus = async (status: SuggestionStatus) => {
    const { count } = await supabase
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", status)

    return [status, count ?? 0] as const
  }

  const [totalResult, statusResults, recentResult] = await Promise.all([
    supabase
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    Promise.all(suggestionStatuses.map(countStatus)),
    supabase
      .from("suggestions")
      .select("id, title, category, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const counts = createEmptyStatusCounts()
  counts.total = totalResult.count ?? 0

  for (const [status, count] of statusResults) {
    counts[status] = count
  }

  return {
    counts,
    recentSuggestions: (recentResult.data ?? []) as SuggestionPreview[],
  }
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

  const suggestions = normalizeAdminSuggestions((data ?? []) as AdminSuggestionRow[])

  return attachSignedUrls(suggestions)
}

export async function getAdminSuggestionCounts(): Promise<StatusCounts> {
  if (!hasSupabaseEnv()) {
    return createEmptyStatusCounts()
  }

  const supabase = await createClient()
  const countStatus = async (status: SuggestionStatus) => {
    const { count } = await supabase
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", status)

    return [status, count ?? 0] as const
  }

  const [totalResult, statusResults] = await Promise.all([
    supabase.from("suggestions").select("id", { count: "exact", head: true }),
    Promise.all(suggestionStatuses.map(countStatus)),
  ])

  const counts = createEmptyStatusCounts()
  counts.total = totalResult.count ?? 0

  for (const [status, count] of statusResults) {
    counts[status] = count
  }

  return counts
}

export async function getAdminSuggestion(suggestionId: string) {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("suggestions")
    .select(
      "id, user_id, title, message, category, status, created_at, updated_at, students(full_name, email, department_id, departments(name)), suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .eq("id", suggestionId)
    .maybeSingle()

  if (!data) {
    return null
  }

  const [suggestion] = await attachSignedUrls(
    normalizeAdminSuggestions([data as AdminSuggestionRow])
  )

  return suggestion ?? null
}

function normalizeAdminSuggestions(rows: AdminSuggestionRow[]) {
  return rows.map((suggestion) => {
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
            department_id: student.department_id as DepartmentId | null,
            department_name: department?.name ?? null,
          }
        : null,
    }
  })
}

export function getStatusCounts(
  suggestions: { status: SuggestionStatus }[]
): StatusCounts {
  return suggestions.reduce(
    (counts, suggestion) => {
      counts[suggestion.status] += 1
      counts.total += 1
      return counts
    },
    createEmptyStatusCounts()
  )
}

export { ATTACHMENTS_BUCKET }
