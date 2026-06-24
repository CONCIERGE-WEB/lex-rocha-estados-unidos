"use client";

import { useState } from "react";

type Props = {
  plano?: string;
  className?: string;
  children?: React.ReactNode;
};

export function WhatsAppCta({ plano, className = "btn-primary", children }: Props) {
  const [aCarregar, setACarregar] = useState(false);
  const [erro, setErro] = useState("");

  const abrir = async () => {
    setErro("");
    setACarregar(true);
    try {
      const res = await fetch("/api/whatsapp/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();
      if (!res.ok || !data.waUrl) {
        setErro(data.error ?? data.erro ?? "Could not open WhatsApp.");
        return;
      }
      window.open(data.waUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErro("Connection error. Please try again.");
    } finally {
      setACarregar(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={abrir}
        disabled={aCarregar}
        className={`${className} inline-flex items-center justify-center gap-2`}
      >
        <span aria-hidden="true">💬</span>
        {aCarregar ? "Opening…" : children ?? "Contact via WhatsApp"}
      </button>
      {erro ? (
        <p className="mt-2 text-sm font-medium text-red-800">{erro}</p>
      ) : null}
    </div>
  );
}
