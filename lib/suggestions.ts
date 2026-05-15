import "server-only"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import type {
  AdminSuggestion,
  DepartmentId,
  Suggestion,
  SuggestionAttachment,
  TeacherSupport,
  StatusCounts,
  SuggestionStatus,
} from "@/lib/types"
import { suggestionStatuses } from "@/lib/types"

const ATTACHMENTS_BUCKET = "suggestion-attachments"
const SIGNED_URL_TTL = 60 * 10

type StudentRelation = {
  id: string
  full_name: string | null
  email: string | null
  department_id: string | null
  departments?: { name: string | null } | { name: string | null }[] | null
}

type AdminSuggestionRow = Omit<AdminSuggestion, "students">

type TeacherSupportRelation = {
  suggestion_id: string
  teacher_id: string
  created_at: string
  teachers?:
    | {
        full_name: string | null
        departments?: { name: string | null } | { name: string | null }[] | null
      }
    | {
        full_name: string | null
        departments?: { name: string | null } | { name: string | null }[] | null
      }[]
    | null
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
      "id, user_id, title, message, category, status, rejection_reason, created_at, updated_at, suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const suggestions = await attachTeacherSupportInfo((data ?? []) as Suggestion[])

  return attachSignedUrls(suggestions)
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
      "id, user_id, title, message, category, status, rejection_reason, created_at, updated_at, suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .order("created_at", { ascending: false })

  const suggestionsWithSubmitters = await attachSubmitters(
    (data ?? []) as AdminSuggestionRow[]
  )
  const suggestions = await attachTeacherSupportInfo(suggestionsWithSubmitters)

  return attachSignedUrls(suggestions)
}

export async function getTeacherReviewSuggestions(teacherId: string) {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createClient()
  const [teacherResult, suggestionsResult] = await Promise.all([
    supabase
      .from("teachers")
      .select("department_id")
      .eq("id", teacherId)
      .maybeSingle(),
    supabase
      .from("suggestions")
      .select(
        "id, user_id, title, message, category, status, rejection_reason, created_at, updated_at"
      )
      .order("created_at", { ascending: false }),
  ])

  const suggestionsWithSubmitters = await attachSubmitters(
    (suggestionsResult.data ?? []) as AdminSuggestionRow[]
  )
  const studentSuggestions = suggestionsWithSubmitters.filter(
    (suggestion) =>
      suggestion.students?.role === "student" &&
      suggestion.students.department_id === teacherResult.data?.department_id
  )

  return attachTeacherSupportInfo(studentSuggestions, teacherId)
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
      "id, user_id, title, message, category, status, rejection_reason, created_at, updated_at, suggestion_attachments(id, suggestion_id, user_id, bucket, path, file_name, mime_type, size, created_at)"
    )
    .eq("id", suggestionId)
    .maybeSingle()

  if (!data) {
    return null
  }

  const [suggestionWithSubmitter] = await attachSubmitters([
    data as AdminSuggestionRow,
  ])
  const [suggestionWithSupport] = await attachTeacherSupportInfo([
    suggestionWithSubmitter,
  ])
  const [suggestion] = await attachSignedUrls([suggestionWithSupport])

  return suggestion ?? null
}

async function attachTeacherSupportInfo<T extends { id: string }>(
  rows: T[],
  currentTeacherId?: string
) {
  if (!rows.length) {
    return rows.map((row) => ({
      ...row,
      teacher_support_count: 0,
      teacher_supported: false,
      teacher_supports: [],
    }))
  }

  const suggestionIds = rows.map((row) => row.id)
  const supabase = await createClient()
  const { data } = await supabase
    .from("suggestion_teacher_supports")
    .select("suggestion_id, teacher_id, created_at, teachers(full_name, departments(name))")
    .in("suggestion_id", suggestionIds)

  const supportsBySuggestion = new Map<string, TeacherSupport[]>()

  for (const support of (data ?? []) as TeacherSupportRelation[]) {
    const teacher = Array.isArray(support.teachers)
      ? support.teachers[0]
      : support.teachers
    const department = Array.isArray(teacher?.departments)
      ? teacher.departments[0]
      : teacher?.departments
    const supports = supportsBySuggestion.get(support.suggestion_id) ?? []

    supports.push({
      suggestion_id: support.suggestion_id,
      teacher_id: support.teacher_id,
      created_at: support.created_at,
      teacher_name: teacher?.full_name ?? null,
      teacher_department_name: department?.name ?? null,
    })
    supportsBySuggestion.set(support.suggestion_id, supports)
  }

  return rows.map((row) => {
    const supports = supportsBySuggestion.get(row.id) ?? []

    return {
      ...row,
      teacher_support_count: supports.length,
      teacher_supported: currentTeacherId
        ? supports.some((support) => support.teacher_id === currentTeacherId)
        : false,
      teacher_supports: supports,
    }
  })
}

async function attachSubmitters(
  rows: AdminSuggestionRow[]
): Promise<AdminSuggestion[]> {
  if (!rows.length) {
    return []
  }

  const userIds = Array.from(new Set(rows.map((row) => row.user_id)))
  const supabase = await createClient()
  const [studentsResult, teachersResult] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, email, department_id, departments(name)")
      .in("id", userIds),
    supabase
      .from("teachers")
      .select("id, full_name, email, department_id, departments(name)")
      .in("id", userIds),
  ])

  const submitters = new Map<string, NonNullable<AdminSuggestion["students"]>>()

  for (const [role, profiles] of [
    ["student", studentsResult.data ?? []],
    ["teacher", teachersResult.data ?? []],
  ] as const) {
    for (const profile of profiles as StudentRelation[]) {
      const department = Array.isArray(profile.departments)
        ? profile.departments[0]
        : profile.departments

      submitters.set(profile.id, {
        full_name: profile.full_name,
        email: profile.email,
        department_id: profile.department_id as DepartmentId | null,
        department_name: department?.name ?? null,
        role,
      })
    }
  }

  return rows.map((suggestion) => ({
    ...suggestion,
    students: submitters.get(suggestion.user_id) ?? null,
  }))
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
