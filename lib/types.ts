export const suggestionStatuses = [
  "new",
  "reviewing",
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

export type SuggestionStatus = (typeof suggestionStatuses)[number]
export type SuggestionCategory = (typeof suggestionCategories)[number]

export type Profile = {
  id: string
  full_name: string | null
  role: "user" | "admin"
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
  profiles?: Pick<Profile, "full_name" | "role"> | null
}
