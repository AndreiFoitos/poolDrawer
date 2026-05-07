import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES  = ["/dashboard", "/projects", "/profile"];
const CONTRACTOR_ROUTES = ["/contractor"];
const ADMIN_ROUTES      = ["/admin"];
const AUTH_ROUTES       = ["/auth/login", "/auth/register"];

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
}

async function getTokenPayload(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    // Token is invalid or expired
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = await getTokenPayload(request);
  const isLoggedIn = payload !== null;

  // Logged-in users visiting auth pages → send to dashboard
  if (isLoggedIn && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not logged in visiting a protected route → send to login
  const isProtected =
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) ||
    CONTRACTOR_ROUTES.some((r) => pathname.startsWith(r)) ||
    ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based checks for contractor and admin routes
  if (isLoggedIn) {
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      CONTRACTOR_ROUTES.some((r) => pathname.startsWith(r)) &&
      payload.role !== "contractor" &&
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};