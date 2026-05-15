import "server-only"

import type { User } from "@supabase/supabase-js"

import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { departments, type DepartmentId, type Profile } from "@/lib/types"

const defaultDepartmentId = departments[0].id

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return getProfileForUser(user)
}

export async function getProfileForUser(user: User): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createClient()
  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name, email, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle()

  if (admin) {
    return {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: "admin",
      department_id: null,
      department_name: null,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    }
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, email, department_id, created_at, updated_at, departments(name)"
    )
    .eq("id", user.id)
    .maybeSingle()

  if (student) {
    const department = Array.isArray(student.departments)
      ? student.departments[0]
      : student.departments

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      department_id: student.department_id as DepartmentId,
      department_name: department?.name ?? null,
      role: "student",
      created_at: student.created_at,
      updated_at: student.updated_at,
    }
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, full_name, email, department_id, created_at, updated_at, departments(name)"
    )
    .eq("id", user.id)
    .maybeSingle()

  if (teacher) {
    const department = Array.isArray(teacher.departments)
      ? teacher.departments[0]
      : teacher.departments

    return {
      id: teacher.id,
      full_name: teacher.full_name,
      email: teacher.email,
      department_id: teacher.department_id as DepartmentId,
      department_name: department?.name ?? null,
      role: "teacher",
      created_at: teacher.created_at,
      updated_at: teacher.updated_at,
    }
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user.email
  const metadataRole =
    user.user_metadata?.role === "teacher" ? "teacher" : "student"
  const metadataDepartment =
    typeof user.user_metadata?.department_id === "string"
      ? user.user_metadata.department_id
      : defaultDepartmentId

  const profileTable = metadataRole === "teacher" ? "teachers" : "students"
  const { data: createdProfile } = await supabase
    .from(profileTable)
    .upsert({
      id: user.id,
      full_name: fullName,
      email: user.email ?? null,
      department_id: metadataDepartment,
    })
    .select(
      "id, full_name, email, department_id, created_at, updated_at, departments(name)"
    )
    .single()

  if (!createdProfile) {
    return null
  }

  const department = Array.isArray(createdProfile.departments)
    ? createdProfile.departments[0]
    : createdProfile.departments

  return {
    id: createdProfile.id,
    full_name: createdProfile.full_name,
    email: createdProfile.email,
    department_id: createdProfile.department_id as DepartmentId,
    department_name: department?.name ?? null,
    role: metadataRole,
    created_at: createdProfile.created_at,
    updated_at: createdProfile.updated_at,
  }
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return user
}

export async function requireStudent() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const profile = await getProfileForUser(user)

  if (profile?.role !== "student" && profile?.role !== "teacher") {
    return null
  }

  return user
}

export async function requireTeacher() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const profile = await getProfileForUser(user)

  if (profile?.role !== "teacher") {
    return null
  }

  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const profile = await getProfileForUser(user)

  if (profile?.role !== "admin") {
    return null
  }

  return profile
}
