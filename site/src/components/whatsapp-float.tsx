"use client";

import { whatsappUrl } from "@/lib/constants/pagamentos";

export function WhatsAppFloat() {
  const url = whatsappUrl();
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact via WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lift transition hover:scale-105"
    >
      <span aria-hidden="true">💬</span>
    </a>
  );
}
