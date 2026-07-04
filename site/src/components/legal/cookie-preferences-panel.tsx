"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  hasConsentDecision,
  readConsent,
  saveConsent,
  syncConsentToServer,
} from "@/lib/cookies/consent-storage";

export function CookiePreferencesPanel() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnalytics(readConsent()?.analytics ?? false);
  }, []);

  async function handleSave(allow: boolean) {
    saveConsent(allow);
    await syncConsentToServer(allow, "configuracoes");
    setAnalytics(allow);
    setSaved(true);
  }

  async function handleRevoke() {
    saveConsent(false);
    await syncConsentToServer(false, "configuracoes", true);
    setAnalytics(false);
    setSaved(true);
  }

  return (
    <div id="preferencias" className="not-prose space-y-4 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Suas preferências</h2>
      {hasConsentDecision() ? (
        <p className="text-sm text-muted-foreground">
          Analíticos atualmente: <strong>{analytics ? "ativados" : "desativados"}</strong>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma preferência salva ainda.</p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
        />
        Permitir cookies analíticos
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => handleSave(analytics)}>
          Salvar preferências
        </Button>
        <Button type="button" variant="outline" onClick={() => handleRevoke()}>
          Revogar consentimento
        </Button>
      </div>
      {saved && (
        <p className="text-sm text-green-800">Preferências atualizadas.</p>
      )}
    </div>
  );
}
