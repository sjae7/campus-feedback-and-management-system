import Link from "next/link"
import {
  ClipboardListIcon,
  MessageSquareTextIcon,
  HomeIcon,
  InboxIcon,
  LightbulbIcon,
  SettingsIcon,
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
    | "student-feedback"
    | "settings"
    | "admin"
    | "admin-suggestions"
    | "admin-users"
}

const sidebarLinkClass =
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate"

const sidebarLogoLinkClass =
  "peer/menu-button group/menu-button flex h-10 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate"

const pageTitles: Record<
  AppShellProps["active"],
  { title: string; description: string }
> = {
  dashboard: {
    title: "Account overview",
    description: "Account, suggestion totals, and next actions",
  },
  submit: {
    title: "Submit feedback and suggestion",
    description: "Send a campus idea or concern to the admin team",
  },
  "my-suggestions": {
    title: "My feedback and suggestions",
    description: "Track admin status updates on every submission",
  },
  "student-feedback": {
    title: "Student feedback",
    description: "Review and support feedback submitted by students",
  },
  settings: {
    title: "Settings",
    description: "Update your account name and department",
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
    description: "Create student, teacher, and admin email accounts",
  },
}

export function AppShell({ children, profile, email, active }: AppShellProps) {
  const isAdmin = profile?.role === "admin"
  const page = pageTitles[active]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="[--sidebar-width:14rem]">
        <SidebarHeader className="gap-1 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                prefetch={false}
                className={sidebarLogoLinkClass}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LightbulbIcon />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">Campus Voice</span>
                  <span className="truncate text-xs">Suggestion system</span>
                </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {!isAdmin ? (
            <SidebarGroup>
              <SidebarGroupLabel className="h-6 px-2">
                {profile?.role === "teacher" ? "Teacher" : "Student"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link
                      href="/dashboard"
                      prefetch={false}
                      title="Overview"
                      data-active={active === "dashboard"}
                      className={sidebarLinkClass}
                    >
                      <HomeIcon />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link
                      href="/dashboard/new"
                      prefetch={false}
                      title="Submit feedback and suggestion"
                      data-active={active === "submit"}
                      className={sidebarLinkClass}
                    >
                      <SendIcon />
                      <span>Submit</span>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link
                      href="/dashboard/suggestions"
                      prefetch={false}
                      title="My feedback and suggestions"
                      data-active={active === "my-suggestions"}
                      className={sidebarLinkClass}
                    >
                      <ClipboardListIcon />
                      <span>Feedback</span>
                    </Link>
                  </SidebarMenuItem>
                  {profile?.role === "teacher" ? (
                    <SidebarMenuItem>
                      <Link
                        href="/dashboard/student-feedback"
                        prefetch={false}
                        title="Student feedback"
                        data-active={active === "student-feedback"}
                        className={sidebarLinkClass}
                      >
                        <MessageSquareTextIcon />
                        <span>Student feedback</span>
                      </Link>
                    </SidebarMenuItem>
                  ) : null}
                  <SidebarMenuItem>
                    <Link
                      href="/dashboard/settings"
                      prefetch={false}
                      title="Settings"
                      data-active={active === "settings"}
                      className={sidebarLinkClass}
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel className="h-6 px-2">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link
                      href="/admin"
                      prefetch={false}
                      title="Admin overview"
                      data-active={active === "admin"}
                      className={sidebarLinkClass}
                    >
                      <ShieldCheckIcon />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link
                      href="/admin/suggestions"
                      prefetch={false}
                      title="Admin inbox"
                      data-active={active === "admin-suggestions"}
                      className={sidebarLinkClass}
                    >
                      <InboxIcon />
                      <span>Admin inbox</span>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link
                      href="/admin/users"
                      prefetch={false}
                      title="Accounts"
                      data-active={active === "admin-users"}
                      className={sidebarLinkClass}
                    >
                      <UserPlusIcon />
                      <span>Accounts</span>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="gap-1 p-2">
          <div className="flex items-center gap-2 rounded-lg px-1.5 py-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <ShieldCheckIcon />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-medium leading-5">
                {profile?.full_name ?? "User"}
              </p>
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
