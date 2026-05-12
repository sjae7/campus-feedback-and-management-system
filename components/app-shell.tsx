import Link from "next/link"
import {
  ClipboardListIcon,
  InboxIcon,
  LightbulbIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { SignOutButton } from "@/components/sign-out-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { Profile } from "@/lib/types"

type AppShellProps = {
  children: React.ReactNode
  profile: Profile | null
  active: "dashboard" | "admin"
}

export function AppShell({ children, profile, active }: AppShellProps) {
  const isAdmin = profile?.role === "admin"

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <LightbulbIcon />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">Campus Voice</span>
                    <span className="truncate text-xs">Suggestion system</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={active === "dashboard"}
                    tooltip="My suggestions"
                  >
                    <Link href="/dashboard">
                      <ClipboardListIcon />
                      <span>My suggestions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "admin"}
                      tooltip="Admin inbox"
                    >
                      <Link href="/admin">
                        <InboxIcon />
                        <span>Admin inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <ShieldCheckIcon />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{profile?.full_name ?? "User"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {isAdmin ? "Admin" : "Student"}
              </p>
            </div>
          </div>
          <SignOutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {active === "admin" ? "Admin dashboard" : "User dashboard"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {active === "admin"
                ? "Review campus suggestions"
                : "Submit and track suggestions"}
            </p>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
