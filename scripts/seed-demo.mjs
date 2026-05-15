import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD ?? "demo-password"

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  )
  process.exit(1)
}

if (demoPassword.length < 8) {
  console.error("DEMO_ACCOUNT_PASSWORD must be at least 8 characters.")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const demoStudents = [
  {
    email: "maria.santos@student.example.com",
    fullName: "Maria Santos",
    departmentId: "computer-studies",
  },
  {
    email: "joshua.reyes@student.example.com",
    fullName: "Joshua Reyes",
    departmentId: "engineering",
  },
  {
    email: "angelica.cruz@student.example.com",
    fullName: "Angelica Cruz",
    departmentId: "nursing",
  },
  {
    email: "paolo.dela-cruz@student.example.com",
    fullName: "Paolo Dela Cruz",
    departmentId: "technology",
  },
]

const demoTeachers = [
  {
    email: "ana.garcia@teacher.example.com",
    fullName: "Ana Garcia",
    departmentId: "computer-studies",
  },
  {
    email: "roberto.lim@teacher.example.com",
    fullName: "Roberto Lim",
    departmentId: "engineering",
  },
  {
    email: "clarissa.villanueva@teacher.example.com",
    fullName: "Clarissa Villanueva",
    departmentId: "nursing",
  },
]

const demoSuggestions = [
  {
    studentEmail: "maria.santos@student.example.com",
    title: "Add more Wi-Fi access points in the library",
    category: "Technology",
    status: "reviewing",
    daysAgo: 1,
    message:
      "The library connection slows down during research hours. Extra access points near the study tables would help students submit work and access online journals.",
    supportedBy: [
      "ana.garcia@teacher.example.com",
      "roberto.lim@teacher.example.com",
    ],
  },
  {
    studentEmail: "joshua.reyes@student.example.com",
    title: "Repair the engineering building water fountain",
    category: "Facilities",
    status: "new",
    daysAgo: 2,
    message:
      "The water fountain near the second-floor laboratories has been out of service for several days. Students need a working drinking station during long lab classes.",
    supportedBy: ["roberto.lim@teacher.example.com"],
  },
  {
    studentEmail: "angelica.cruz@student.example.com",
    title: "Extend clinic hours during examination week",
    category: "Student Services",
    status: "approved",
    daysAgo: 3,
    message:
      "Many students experience stress and minor health concerns during exams. Extending clinic hours would make support easier to access after late review sessions.",
    supportedBy: [
      "clarissa.villanueva@teacher.example.com",
      "ana.garcia@teacher.example.com",
    ],
  },
  {
    studentEmail: "paolo.dela-cruz@student.example.com",
    title: "Improve lighting near the technology parking area",
    category: "Safety",
    status: "reviewing",
    daysAgo: 4,
    message:
      "The parking area beside the technology building is dim after evening classes. Additional lights would make students feel safer when leaving campus.",
    supportedBy: ["ana.garcia@teacher.example.com"],
  },
  {
    studentEmail: "maria.santos@student.example.com",
    title: "Open a quiet study room for thesis groups",
    category: "Academic",
    status: "new",
    daysAgo: 5,
    message:
      "Thesis groups need a quiet place for consultation and document preparation. A scheduled study room would reduce noise in common areas.",
    supportedBy: [],
  },
  {
    studentEmail: "joshua.reyes@student.example.com",
    title: "Add clearer laboratory equipment borrowing rules",
    category: "Academic",
    status: "rejected",
    rejectionReason:
      "The current laboratory manual already includes the borrowing process. The department will repost the existing rules instead.",
    daysAgo: 6,
    message:
      "Students sometimes receive different instructions when borrowing lab equipment. A clearer posted process would avoid delays before experiments.",
    supportedBy: ["roberto.lim@teacher.example.com"],
  },
  {
    studentEmail: "angelica.cruz@student.example.com",
    title: "Provide more shaded waiting areas near the gate",
    category: "Facilities",
    status: "new",
    daysAgo: 7,
    message:
      "Students wait near the gate before rides arrive, but there is limited shade during midday. More covered seating would help during hot weather.",
    supportedBy: [],
  },
]

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) {
      throw error
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === normalizedEmail
    )

    if (user || data.users.length < 1000) {
      return user ?? null
    }

    page += 1
  }
}

async function recreateUser({ email, fullName, departmentId, role }) {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

    if (error) {
      throw error
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      department_id: departmentId,
    },
  })

  if (error || !data.user) {
    throw error ?? new Error(`Could not create ${email}.`)
  }

  const profileTable = role === "teacher" ? "teachers" : "students"
  const { error: profileError } = await supabaseAdmin
    .from(profileTable)
    .upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      department_id: departmentId,
    })

  if (profileError) {
    throw profileError
  }

  return data.user
}

function createdAt(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(9 + (daysAgo % 8), 15, 0, 0)
  return date.toISOString()
}

try {
  const studentUsers = new Map()
  const teacherUsers = new Map()

  for (const student of demoStudents) {
    const user = await recreateUser({ ...student, role: "student" })
    studentUsers.set(student.email, user)
  }

  for (const teacher of demoTeachers) {
    const user = await recreateUser({ ...teacher, role: "teacher" })
    teacherUsers.set(teacher.email, user)
  }

  const suggestionRows = demoSuggestions.map((suggestion) => {
    const user = studentUsers.get(suggestion.studentEmail)

    if (!user) {
      throw new Error(`Missing demo student ${suggestion.studentEmail}.`)
    }

    const timestamp = createdAt(suggestion.daysAgo)

    return {
      user_id: user.id,
      title: suggestion.title,
      category: suggestion.category,
      message: suggestion.message,
      status: suggestion.status,
      rejection_reason: suggestion.rejectionReason ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    }
  })

  const { data: suggestions, error: suggestionError } = await supabaseAdmin
    .from("suggestions")
    .insert(suggestionRows)
    .select("id, title")

  if (suggestionError || !suggestions) {
    throw suggestionError ?? new Error("Could not create demo suggestions.")
  }

  const suggestionIdsByTitle = new Map(
    suggestions.map((suggestion) => [suggestion.title, suggestion.id])
  )
  const supportRows = demoSuggestions.flatMap((suggestion) => {
    const suggestionId = suggestionIdsByTitle.get(suggestion.title)

    if (!suggestionId) {
      return []
    }

    return suggestion.supportedBy.map((teacherEmail) => {
      const teacher = teacherUsers.get(teacherEmail)

      if (!teacher) {
        throw new Error(`Missing demo teacher ${teacherEmail}.`)
      }

      return {
        suggestion_id: suggestionId,
        teacher_id: teacher.id,
      }
    })
  })

  if (supportRows.length) {
    const { error: supportError } = await supabaseAdmin
      .from("suggestion_teacher_supports")
      .insert(supportRows)

    if (supportError) {
      throw supportError
    }
  }

  console.log("Demo data seeded.")
  console.log(`Password for demo accounts: ${demoPassword}`)
  console.log(`Students: ${demoStudents.map((student) => student.fullName).join(", ")}`)
  console.log(`Teachers: ${demoTeachers.map((teacher) => teacher.fullName).join(", ")}`)
  console.log(`Suggestions: ${demoSuggestions.length}`)
  console.log(`Teacher support rows: ${supportRows.length}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
