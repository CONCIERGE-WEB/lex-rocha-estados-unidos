"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { COPY } from "@/lib/constants/copy-en";

export type TrackOrderResult = {
  code: string;
  status: string;
  statusLabel: string;
  plan?: string | null;
  area?: string | null;
  name?: string | null;
  createdAt?: string | null;
  sentAt?: string | null;
};

type Props = {
  initialCode?: string;
};

export function TrackOrderForm({ initialCode = "" }: Props) {
  const T = COPY.track;
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackOrderResult | null>(null);

  useEffect(() => {
    if (initialCode.length >= 6) {
      void lookup(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function lookup(value: string) {
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(value.trim())}`);
      const data = (await res.json()) as TrackOrderResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? T.notFound);
        return;
      }
      setOrder(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void lookup(code);
  };

  return (
    <div className="space-y-6">
      <div className="feature-card">
        <h2 className="font-display text-xl font-semibold text-ink">{T.formTitle}</h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="input-field mt-0 flex-1 uppercase tracking-widest"
            placeholder={T.placeholder}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
            aria-label="Tracking code"
          />
          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            {loading ? T.loading : T.submit}
          </button>
        </form>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="feature-card border-trust/30">
          <p className="font-display text-xl font-semibold text-trust">{order.statusLabel}</p>
          <p className="mt-1 font-mono text-sm text-muted">Code: {order.code}</p>
          <dl className="mt-4 space-y-2 text-sm text-ink">
            {order.name ? (
              <div>
                <dt className="font-semibold text-muted">Name</dt>
                <dd>{order.name}</dd>
              </div>
            ) : null}
            {order.plan ? (
              <div>
                <dt className="font-semibold text-muted">Plan</dt>
                <dd>{order.plan}</dd>
              </div>
            ) : null}
            {order.area ? (
              <div>
                <dt className="font-semibold text-muted">Area</dt>
                <dd>{order.area}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-xs text-muted">{T.estimateNote}</p>
        </div>
      ) : null}

      <p className="text-center text-sm text-muted">
        <Link href="/#pedir-relatorio" className="font-semibold text-trust underline underline-offset-4">
          {T.newRequest}
        </Link>
      </p>
    </div>
  );
}
