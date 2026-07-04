"use client";

import { MessageCircle } from "lucide-react";

import { copyComSite } from "@/lib/constants/copy-helpers";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { montarLinkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  if (!whatsappConfigurado()) return null;

  const mensagem = copyComSite(COPY_SITE.whatsappFloat.mensagem);

  return (
    <a
      href={montarLinkWhatsApp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={COPY_SITE.whatsappFloat.label}
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
