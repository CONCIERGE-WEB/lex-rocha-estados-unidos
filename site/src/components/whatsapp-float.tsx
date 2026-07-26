"use client";

import { WhatsAppIcon } from "@/components/whatsapp-icon";
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
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift ring-2 ring-white/90 transition hover:scale-105 hover:bg-[#20BD5A] focus:outline-none focus:ring-2 focus:ring-trust focus:ring-offset-2 motion-safe:animate-float-pulse"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  );
}
