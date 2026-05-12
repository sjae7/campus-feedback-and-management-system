import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import pg from "pg"

const databaseUrl = process.env.SUPABASE_DB_URL

if (!databaseUrl) {
  console.error("Missing SUPABASE_DB_URL in .env.local.")
  process.exit(1)
}

const schemaPath = resolve("supabase/schema.sql")
const schema = await readFile(schemaPath, "utf8")
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

try {
  await client.connect()
  await client.query(schema)
  console.log("Supabase departments, account tables, policies, and storage bucket are ready.")
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
