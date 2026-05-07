/**
 * A thin wrapper around fetch that automatically attaches the stored
 * JWT token to every request as an Authorization: Bearer header.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/apiFetch";
 *   const data = await apiFetch("/satellite/?lat=...");
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const COOKIE_NAME = "access_token";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  // 24 hours, matching the JWT expiry in the backend
  const maxAge = 60 * 60 * 24;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}