"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      if (!code) {
        router.push("/auth/login?error=missing_code");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        router.push("/auth/login?error=invalid_code");
        return;
      }

      if (type === "recovery") {
        router.push("/auth/reset-password");
        return;
      }

      const user = data.session.user;
      const contractorIntent = user.user_metadata?.contractor_intent === true;

      if (contractorIntent) {
        const { data: existingProfile } = await supabase
          .from("contractor_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!existingProfile) {
          router.push("/contractor/profile/setup");
          return;
        }
      }

      router.push("/dashboard");
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Verifying your account…</p>
      </div>
    </main>
  );
}