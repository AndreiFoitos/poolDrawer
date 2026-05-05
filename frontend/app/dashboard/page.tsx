"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-12">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 text-sm">
        Logged in as <strong>{user?.email}</strong> — role:{" "}
        <strong>{profile?.role ?? "loading…"}</strong>
      </p>
      <button onClick={signOut}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
        Sign out
      </button>
    </main>
  );
}