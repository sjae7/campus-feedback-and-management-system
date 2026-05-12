import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env"

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options)
  })
}

function redirectWithCookies(
  request: NextRequest,
  source: NextResponse,
  pathname: string
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""

  const response = NextResponse.redirect(url)
  copyCookies(source, response)

  return response
}

export async function proxy(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/")
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  const isProtectedPath = isAdminPath || isDashboardPath
  const isAuthPage = pathname === "/" || pathname === "/login" || pathname === "/signup"

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return isProtectedPath
      ? redirectWithCookies(request, response, "/login")
      : response
  }

  if (!isProtectedPath && !isAuthPage) {
    return response
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  const isAdmin = Boolean(admin)
  const dashboardPath = isAdmin ? "/admin" : "/dashboard"

  if (isAuthPage) {
    return redirectWithCookies(request, response, dashboardPath)
  }

  if (isAdmin && isDashboardPath) {
    return redirectWithCookies(request, response, "/admin")
  }

  if (!isAdmin && isAdminPath) {
    return redirectWithCookies(request, response, "/dashboard")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
