import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ConfigurationNotice() {
  return (
    <Alert>
      <AlertCircleIcon data-icon="inline-start" />
      <AlertTitle>Supabase is not configured</AlertTitle>
      <AlertDescription>
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
        `.env.local`, then restart the development server.
      </AlertDescription>
    </Alert>
  )
}
