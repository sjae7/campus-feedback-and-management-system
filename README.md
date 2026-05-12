# Campus Feedback and Management System

Campus Voice is a Next.js suggestion system for campus feedback. Users create an account, submit suggestions with optional attachments, and track review status. Admins use a separate dashboard to filter, review, and triage submissions.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth, Postgres, Storage, and RLS

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=your-supabase-postgres-connection-string
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=change-this-password
DEFAULT_ADMIN_FULL_NAME=System Admin
DEFAULT_STUDENT_EMAIL=student@example.com
DEFAULT_STUDENT_PASSWORD=student-password
DEFAULT_STUDENT_FULL_NAME=Sample Student
DEFAULT_STUDENT_DEPARTMENT_ID=computer-studies
```

Create the database tables and policies:

```bash
npm run db:setup
```

This runs `supabase/schema.sql` and creates:

- `departments`
- `students`
- `admins`
- `suggestions`
- `suggestion_attachments`
- private `suggestion-attachments` storage bucket
- RLS policies for users and admins
- trigger to create a student or admin row after account creation

To drop the old tables, recreate the schema, and seed one admin plus one
student account:

```bash
npm run db:reset
```

This is destructive. It removes the app tables, attachment storage objects, and
seed users matching the configured seed emails before recreating them.

Create the first admin account:

```bash
npm run seed:admin
```

After that, sign in with `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD`.
Admins can create more user or admin accounts from `/admin`.

Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

Build commands do not run database setup, reset, or seed scripts. Those scripts
are kept separate under `scripts/` and must be run manually with `npm run
db:setup`, `npm run db:reset`, or `npm run seed:admin`.

## Workflows

Users:

- Sign up or sign in.
- Open `/dashboard`.
- Submit a suggestion with title, category, message, and optional attachment.
- Track statuses: `new`, `reviewing`, `approved`, `rejected`.

Admins:

- Create the first admin with `npm run seed:admin`.
- Open `/admin`.
- Create student or admin accounts with email and temporary password.
- Search and filter all suggestions.
- Update suggestion status.
- Open private attachments through short-lived signed URLs.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run db:setup
npm run db:reset
npm run seed:admin
```

## Notes

- Anonymous suggestions are intentionally not supported.
- Attachment files are stored in `suggestion-attachments` under `userId/suggestionId/fileName`.
- Do not commit `.env.local` or Supabase service role keys.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_DB_URL` is the Postgres connection string from Supabase Project Settings, not the REST API URL.
