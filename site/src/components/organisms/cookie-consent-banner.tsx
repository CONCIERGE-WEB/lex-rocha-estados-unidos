"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import {
  hasConsentDecision,
  readConsent,
  saveConsent,
  syncConsentToServer,
} from "@/lib/cookies/consent-storage";

const { cookies: copyCookies } = COPY_SITE;

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    const decided = hasConsentDecision();
    setVisible(!decided);
    if (decided) {
      setAnalytics(readConsent()?.analytics ?? false);
    }

    const onOpen = () => {
      setManageOpen(true);
      setVisible(true);
      setAnalytics(readConsent()?.analytics ?? false);
    };
    window.addEventListener("lex-rocha:open-cookie-settings", onOpen);
    return () => window.removeEventListener("lex-rocha:open-cookie-settings", onOpen);
  }, []);

  const finalize = useCallback(async (allowAnalytics: boolean) => {
    if (saving) return;
    setSaving(true);

    try {
      saveConsent(allowAnalytics);
      // Fecha imediatamente para evitar sensação de botão travado.
      setVisible(false);
      setManageOpen(false);
      void syncConsentToServer(allowAnalytics, manageOpen ? "configuracoes" : "banner");
    } finally {
      setSaving(false);
    }
  }, [manageOpen, saving]);

  if (!mounted || !visible) return null;

  return (
    <div
      className="mobile-no-blur fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background p-4 shadow-lg md:bg-background/95 md:backdrop-blur-md"
      role="dialog"
      aria-label={copyCookies.dialogLabel}
    >
      <div className="mx-auto max-w-4xl">
        {!manageOpen ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{copyCookies.title}</p>
              <p>
                Usamos cookies necessários para o funcionamento do site. Cookies analíticos
                só são ativados com seu consentimento. Leia a{" "}
                <Link href="/privacidade" className="text-primary underline">
                  Política de Privacidade
                </Link>{" "}
                e a{" "}
                <Link href="/cookies" className="text-primary underline">
                  Política de Cookies
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={saving}
                onClick={() => finalize(false)}
              >
                Rejeitar todos
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={saving}
                onClick={() => setManageOpen(true)}
              >
                Gerenciar preferências
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={saving}
                onClick={() => finalize(true)}
              >
                {saving ? "Salvando..." : "Aceitar todos"}
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="font-medium text-foreground">Gerenciar preferências</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 rounded-md border p-3">
                  <div>
                    <p className="font-medium">Necessários</p>
                    <p className="text-muted-foreground">
                      Sessão, segurança e preferências. Sempre ativos.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-primary">Ativo</span>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-md border p-3">
                  <div>
                    <p className="font-medium">Analíticos</p>
                    <p className="text-muted-foreground">
                      Métricas de uso (ex.: Vercel Analytics), se habilitado.
                    </p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                    />
                    <span className="sr-only">Ativar analíticos</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={saving} onClick={() => finalize(false)}>
                  Rejeitar analíticos
                </Button>
                <Button type="button" disabled={saving} onClick={() => finalize(analytics)}>
                  {saving ? "Salvando..." : "Salvar preferências"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
