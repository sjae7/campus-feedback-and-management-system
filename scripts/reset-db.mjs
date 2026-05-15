import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import pg from "pg"
import { createClient } from "@supabase/supabase-js"

const databaseUrl = process.env.SUPABASE_DB_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminSeed = {
  email: process.env.DEFAULT_ADMIN_EMAIL ?? "admin@example.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD ?? "change-this-password",
  fullName: process.env.DEFAULT_ADMIN_FULL_NAME ?? "System Admin",
}

const studentSeed = {
  email: process.env.DEFAULT_STUDENT_EMAIL ?? "student@example.com",
  password: process.env.DEFAULT_STUDENT_PASSWORD ?? "student-password",
  fullName: process.env.DEFAULT_STUDENT_FULL_NAME ?? "Sample Student",
  departmentId: process.env.DEFAULT_STUDENT_DEPARTMENT_ID ?? "computer-studies",
}

const teacherSeed = {
  email: process.env.DEFAULT_TEACHER_EMAIL ?? "teacher@example.com",
  password: process.env.DEFAULT_TEACHER_PASSWORD ?? "teacher-password",
  fullName: process.env.DEFAULT_TEACHER_FULL_NAME ?? "Sample Teacher",
  departmentId: process.env.DEFAULT_TEACHER_DEPARTMENT_ID ?? "computer-studies",
}
const attachmentsBucket = "suggestion-attachments"

if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_DB_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  )
  process.exit(1)
}

for (const account of [adminSeed, studentSeed, teacherSeed]) {
  if (account.password.length < 8) {
    console.error(`Password for ${account.email} must be at least 8 characters.`)
    process.exit(1)
  }
}

const resetSql = `
drop trigger if exists on_auth_user_created on auth.users;

drop policy if exists "Users can upload own suggestion attachments" on storage.objects;
drop policy if exists "Users can read own suggestion attachments and admins can read all" on storage.objects;
drop policy if exists "Users can delete own suggestion attachments and admins can delete all" on storage.objects;

drop table if exists public.suggestion_attachments cascade;
drop table if exists public.suggestion_teacher_supports cascade;
drop table if exists public.suggestions cascade;
drop table if exists public.profiles cascade;
drop table if exists public.students cascade;
drop table if exists public.teachers cascade;
drop table if exists public.admins cascade;
drop table if exists public.departments cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.set_updated_at() cascade;

drop type if exists public.user_role cascade;
drop type if exists public.suggestion_status cascade;
`

const schemaPath = resolve("supabase/schema.sql")
const schema = await readFile(schemaPath, "utf8")
const db = new pg.Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function deleteStorageBucket(bucketId) {
  const { data: buckets, error: listError } =
    await supabaseAdmin.storage.listBuckets()

  if (listError) {
    throw listError
  }

  if (!buckets.some((bucket) => bucket.id === bucketId)) {
    return
  }

  const { error: emptyError } = await supabaseAdmin.storage.emptyBucket(bucketId)

  if (emptyError) {
    throw emptyError
  }

  const { error: deleteError } =
    await supabaseAdmin.storage.deleteBucket(bucketId)

  if (deleteError) {
    throw deleteError
  }
}

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

async function recreateUser({ email, password, fullName, role, departmentId }) {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

    if (error) {
      throw error
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
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

  if (role === "admin") {
    const { error: adminError } = await supabaseAdmin.from("admins").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
    })

    if (adminError) {
      throw adminError
    }
  } else {
    const profileTable = role === "teacher" ? "teachers" : "students"
    const { error: profileError } = await supabaseAdmin.from(profileTable).upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      department_id: departmentId,
    })

    if (profileError) {
      throw profileError
    }
  }
}

try {
  await deleteStorageBucket(attachmentsBucket)

  await db.connect()
  await db.query(resetSql)
  await db.query(schema)

  await recreateUser({
    ...adminSeed,
    role: "admin",
  })
  await recreateUser({
    ...studentSeed,
    role: "student",
  })
  await recreateUser({
    ...teacherSeed,
    role: "teacher",
  })

  console.log("Database reset complete.")
  console.log(`Seeded admin: ${adminSeed.email}`)
  console.log(`Seeded student: ${studentSeed.email}`)
  console.log(`Seeded teacher: ${teacherSeed.email}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await db.end()
}
