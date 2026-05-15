"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentUser, getProfileForUser } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { departmentIds } from "@/lib/types"

export type ProfileActionState = {
  message?: string
  success?: boolean
  errors?: {
    fullName?: string[]
    department?: string[]
  }
}

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  department: z.enum(departmentIds, {
    error: "Choose a department.",
  }),
})

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  if (!hasSupabaseEnv()) {
    return {
      message: "Supabase is not configured.",
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    return {
      message: "Only student and teacher profiles can be updated here.",
    }
  }

  const profile = await getProfileForUser(user)

  if (profile?.role !== "student" && profile?.role !== "teacher") {
    return {
      message: "Only student and teacher profiles can be updated here.",
    }
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    department: formData.get("department"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const profileTable = profile.role === "teacher" ? "teachers" : "students"
  const supabase = await createClient()
  const { error } = await supabase
    .from(profileTable)
    .update({
      full_name: parsed.data.fullName,
      department_id: parsed.data.department,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath("/", "layout")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/suggestions")
  revalidatePath("/dashboard/student-feedback")

  return {
    success: true,
    message: "Account settings updated.",
  }
}
