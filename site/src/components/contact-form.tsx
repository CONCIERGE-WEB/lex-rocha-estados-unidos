"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { COPY } from "@/lib/constants/copy-en";

export function ContactForm() {
  const C = COPY.contacto;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setSent(false);
    if (!consent) {
      setErro("You must accept the privacy policy.");
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErro("Please fill in name, email, and message.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name.trim(),
          email: email.trim(),
          mensagem: message.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; erro?: string; error?: string };
      if (!res.ok || !data.ok) {
        setErro(data.erro ?? data.error ?? "Could not send. Please try again.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      setConsent(false);
    } catch {
      setErro("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <p
        className="cite-block mt-8 text-body font-medium text-ink"
        role="status"
        aria-live="polite"
      >
        {C.confirmacao}
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="cite-block mt-8 space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-base font-semibold text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="flex gap-3">
        <input
          id="privacy-consent"
          name="privacy-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-trust"
        />
        <label htmlFor="privacy-consent" className="text-body leading-relaxed text-muted">
          I have read and accept the{" "}
          <Link href="/privacy" className="font-medium text-trust underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          and authorize processing of my personal data to respond to my request.
        </label>
      </div>
      {erro ? <p className="text-sm font-medium text-verify">{erro}</p> : null}
      <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
        {sending ? C.aEnviar : C.enviar}
      </button>
      <p className="text-sm text-muted">
        To exercise privacy rights (access, deletion), see our{" "}
        <Link href="/privacy" className="font-medium text-trust underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
