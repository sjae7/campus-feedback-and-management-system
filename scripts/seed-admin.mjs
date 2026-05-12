import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.DEFAULT_ADMIN_EMAIL
const password = process.env.DEFAULT_ADMIN_PASSWORD
const fullName = process.env.DEFAULT_ADMIN_FULL_NAME ?? "System Admin"

if (!supabaseUrl || !serviceRoleKey || !email || !password) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEFAULT_ADMIN_EMAIL, or DEFAULT_ADMIN_PASSWORD."
  )
  process.exit(1)
}

if (password.length < 8) {
  console.error("DEFAULT_ADMIN_PASSWORD must be at least 8 characters.")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
  },
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
  id: data.user.id,
  full_name: fullName,
  role: "admin",
})

if (profileError) {
  console.error(profileError.message)
  process.exit(1)
}

console.log(`Admin account created for ${email}.`)
