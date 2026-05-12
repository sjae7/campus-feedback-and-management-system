import { LogOutIcon } from "lucide-react"

import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" className="w-full justify-start">
        <LogOutIcon data-icon="inline-start" />
        Sign out
      </Button>
    </form>
  )
}
