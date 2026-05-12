export const suggestionStatuses = [
  "new",
  "reviewing",
  "approved",
  "resolved",
  "rejected",
] as const

export const suggestionCategories = [
  "Academic",
  "Facilities",
  "Student Services",
  "Safety",
  "Technology",
  "Other",
] as const

export const departments = [
  {
    id: "computer-studies",
    name: "Computer Studies Department",
  },
  {
    id: "engineering",
    name: "Engineering Department",
  },
  {
    id: "technology",
    name: "Technology Department",
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship Department",
  },
  {
    id: "teacher-education",
    name: "Teacher Education Department",
  },
  {
    id: "nursing",
    name: "Nursing Department",
  },
] as const

export type DepartmentId = (typeof departments)[number]["id"]

export const departmentIds = departments.map(
  (department) => department.id
) as [DepartmentId, ...DepartmentId[]]

export type SuggestionStatus = (typeof suggestionStatuses)[number]
export type SuggestionCategory = (typeof suggestionCategories)[number]

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  department_id: DepartmentId | null
  department_name: string | null
  role: "student" | "admin"
  created_at: string
  updated_at: string
}

export type SuggestionAttachment = {
  id: string
  suggestion_id: string
  user_id: string
  bucket: string
  path: string
  file_name: string
  mime_type: string | null
  size: number | null
  created_at: string
  signedUrl?: string | null
}

export type Suggestion = {
  id: string
  user_id: string
  title: string
  message: string
  category: string
  status: SuggestionStatus
  created_at: string
  updated_at: string
  suggestion_attachments?: SuggestionAttachment[]
}

export type AdminSuggestion = Suggestion & {
  students?:
    | Pick<Profile, "full_name" | "email" | "department_id" | "department_name">
    | null
}
