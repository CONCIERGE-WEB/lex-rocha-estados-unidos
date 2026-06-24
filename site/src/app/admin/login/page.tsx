"use client";

import { createClient, supabaseBrowserConfigurado } from "@/lib/supabase/client";
import { EMPRESA } from "@/lib/constants/empresa";
import { useState } from "react";

export default function AdminLogin() {
  const [erro, setErro] = useState("");
  const configurado = supabaseBrowserConfigurado();

  async function loginComGoogle() {
    setErro("");
    if (!configurado) {
      setErro("Admin login is not configured yet (Supabase env vars missing).");
      return;
    }
    const supabase = createClient();
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
        {!configurado ? (
          <p className="text-sm font-medium text-amber-800">
            Supabase is not configured on this deployment. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.
          </p>
        ) : null}
        <button
          type="button"
          onClick={loginComGoogle}
          disabled={!configurado}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign in with Google
        </button>
        {erro ? <p className="text-sm font-medium text-red-700">{erro}</p> : null}
      </div>
    </div>
  );
}
