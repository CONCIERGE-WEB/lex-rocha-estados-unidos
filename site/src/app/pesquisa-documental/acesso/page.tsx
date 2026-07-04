"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkspaceAcessoPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch("/api/workspace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const json = (await res.json()) as { erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Falha na autenticação.");
      router.push("/pesquisa-documental");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Acesso interno</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ferramenta de pesquisa documental — uso exclusivo do operador.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Senha do workspace</span>
              <input
                type="password"
                className="w-full rounded-md border border-input px-3 py-2"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/" className="text-primary hover:underline">
              ← Voltar ao site
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
