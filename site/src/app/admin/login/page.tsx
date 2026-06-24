"use client";

import { createClient } from "@/lib/supabase/client";
import { EMPRESA } from "@/lib/constants/empresa";

export default function AdminLogin() {
  const supabase = createClient();

  async function loginComGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/relatorios`,
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div>
          <h1 className="text-lg font-medium text-slate-800">{EMPRESA.marca}</h1>
          <p className="mt-1 text-sm text-slate-400">Restricted area</p>
        </div>
        <button
          type="button"
          onClick={loginComGoogle}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
