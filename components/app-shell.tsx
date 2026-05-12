import Link from "next/link"
import {
  ClipboardListIcon,
  HomeIcon,
  InboxIcon,
  LightbulbIcon,
  SendIcon,
  ShieldCheckIcon,
  UserPlusIcon,
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
  email?: string | null
  active:
    | "dashboard"
    | "submit"
    | "my-suggestions"
    | "admin"
    | "admin-suggestions"
    | "admin-users"
}

const pageTitles: Record<
  AppShellProps["active"],
  { title: string; description: string }
> = {
  dashboard: {
    title: "Student overview",
    description: "Account, suggestion totals, and next actions",
  },
  submit: {
    title: "Submit suggestion",
    description: "Send a campus idea or concern to the admin team",
  },
  "my-suggestions": {
    title: "My suggestions",
    description: "Track admin status updates on every submission",
  },
  admin: {
    title: "Admin overview",
    description: "Review workload and admin shortcuts",
  },
  "admin-suggestions": {
    title: "Admin inbox",
    description: "Approve, reject, or review campus suggestions",
  },
  "admin-users": {
    title: "Account management",
    description: "Create student and admin email accounts",
  },
}

export function AppShell({ children, profile, email, active }: AppShellProps) {
  const isAdmin = profile?.role === "admin"
  const page = pageTitles[active]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
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
          {!isAdmin ? (
            <SidebarGroup>
              <SidebarGroupLabel>Student</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "dashboard"}
                      tooltip="Overview"
                    >
                      <Link href="/dashboard">
                        <HomeIcon />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "submit"}
                      tooltip="Submit suggestion"
                    >
                      <Link href="/dashboard/new">
                        <SendIcon />
                        <span>Submit</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "my-suggestions"}
                      tooltip="My suggestions"
                    >
                      <Link href="/dashboard/suggestions">
                        <ClipboardListIcon />
                        <span>My suggestions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "admin"}
                      tooltip="Admin overview"
                    >
                      <Link href="/admin">
                        <ShieldCheckIcon />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "admin-suggestions"}
                      tooltip="Admin inbox"
                    >
                      <Link href="/admin/suggestions">
                        <InboxIcon />
                        <span>Admin inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === "admin-users"}
                      tooltip="Accounts"
                    >
                      <Link href="/admin/users">
                        <UserPlusIcon />
                        <span>Accounts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
                {email ?? (isAdmin ? "Admin" : profile?.department_name)}
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
            <p className="truncate text-sm font-medium">{page.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {page.description}
            </p>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
