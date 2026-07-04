import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { montarLinkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

type Props = {
  mensagem: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function WhatsAppButton({
  mensagem,
  children,
  variant = "outline",
  size = "default",
  className,
}: Props) {
  if (!whatsappConfigurado()) return null;

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={montarLinkWhatsApp(mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2"
      >
        <MessageCircle className="size-4" />
        {children}
      </a>
    </Button>
  );
}
