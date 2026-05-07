"use client";

import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming soon</h2>
        <p className="text-gray-500 text-sm">
          Password reset is not available yet.
        </p>
        <Link href="/auth/login" className="inline-block mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium">
          ← Back to login
        </Link>
      </div>
    </main>
  );
}