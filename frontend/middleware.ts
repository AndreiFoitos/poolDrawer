import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/projects", "/profile"];

// Routes that require contractor role specifically
const CONTRACTOR_ROUTES = ["/contractor"];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

// Auth pages — redirect away if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and getUser.
  // A simple mistake could make it hard to debug issues with users being
  // randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If logged in and trying to visit auth pages, redirect to dashboard
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not logged in and trying to visit a protected route, redirect to login
  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    CONTRACTOR_ROUTES.some((route) => pathname.startsWith(route)) ||
    ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && isProtected) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For contractor and admin routes, we need to check the role.
  // We fetch the profile from public.users here.
  if (
    user &&
    (CONTRACTOR_ROUTES.some((r) => pathname.startsWith(r)) ||
      ADMIN_ROUTES.some((r) => pathname.startsWith(r)))
  ) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (CONTRACTOR_ROUTES.some((r) => pathname.startsWith(r))) {
      if (profile?.role !== "contractor" && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // IMPORTANT: return supabaseResponse, not NextResponse.next().
  // supabaseResponse has the refreshed session cookies attached.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run middleware on all routes except static files and Supabase internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};