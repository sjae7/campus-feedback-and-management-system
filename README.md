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
DEFAULT_TEACHER_EMAIL=teacher@example.com
DEFAULT_TEACHER_PASSWORD=teacher-password
DEFAULT_TEACHER_FULL_NAME=Sample Teacher
DEFAULT_TEACHER_DEPARTMENT_ID=computer-studies
```

Create the database tables and policies:

```bash
npm run db:setup
```

This runs `supabase/schema.sql` and creates:

- `departments`
- `students`
- `teachers`
- `admins`
- `suggestions`
- `suggestion_attachments`
- `suggestion_teacher_supports`
- private `suggestion-attachments` storage bucket
- RLS policies for users and admins
- trigger to create a student, teacher, or admin row after account creation

To drop the old tables, recreate the schema, and seed one admin, one student,
and one teacher account:

```bash
npm run db:reset
```

This is destructive. It removes the app tables, attachment storage objects, and
seed users matching the configured seed emails before recreating them.

Seed demo students, teachers, feedback, and teacher-support records:

```bash
npm run db:seed-demo
```

The demo script creates named students and teachers with the default password
`demo-password` unless `DEMO_ACCOUNT_PASSWORD` is set.

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
- Submit feedback and suggestions with title, category, message, and optional attachment.
- Track statuses and rejection reasons from admins.
- Update account name and enrolled department from Settings.

Teachers:

- Submit and track their own feedback.
- Review student feedback from the Student feedback page.
- Support student feedback so admins can see teacher-backed items.
- Update account name and department from Settings.

Admins:

- Create the first admin with `npm run seed:admin`.
- Open `/admin`.
- Create student, teacher, or admin accounts with email and temporary password.
- Search and filter all suggestions.
- Sort suggestions by teacher support and see how many teachers supported each feedback item.
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
npm run db:seed-demo
npm run seed:admin
```

## Notes

- Anonymous suggestions are intentionally not supported.
- Attachment files are stored in `suggestion-attachments` under `userId/suggestionId/fileName`.
- Do not commit `.env.local` or Supabase service role keys.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_DB_URL` is the Postgres connection string from Supabase Project Settings, not the REST API URL.
