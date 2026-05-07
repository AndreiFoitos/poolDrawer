"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearToken, getToken, setToken } from "@/lib/apiFetch";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "homeowner" | "contractor" | "admin";
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, role?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, if a token exists try to fetch the current user
  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        const data: UserProfile = await res.json();
        setUser(data);
      } else {
        // Token is invalid or expired — clear it
        clearToken();
      }
    } catch {
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Login failed");
    }

    const { access_token } = await res.json();
    setToken(access_token);

    // Fetch the user profile now that the token is stored
    const meRes = await apiFetch("/auth/me");
    const profile: UserProfile = await meRes.json();
    setUser(profile);

    router.push("/dashboard");
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string,
    role: string = "homeowner"
  ) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Registration failed");
    }

    const { access_token } = await res.json();
    setToken(access_token);

    const meRes = await apiFetch("/auth/me");
    const profile: UserProfile = await meRes.json();
    setUser(profile);

    router.push("/dashboard");
  };

  const signOut = () => {
    clearToken();
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}