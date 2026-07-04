import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { copyComSite } from "@/lib/constants/copy-helpers";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { montarLinkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";
import { SITE } from "@/lib/constants/site";

import { ManageCookiesButton } from "@/components/legal/manage-cookies-button";

const legalLinks = [
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/cookies", label: "Política de cookies" },
  { href: "/termos", label: "Termos de uso" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const waMsg = copyComSite(COPY_SITE.footer.whatsappMensagem);

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Logo className="[&_span]:text-primary-foreground" />
            <p className="text-sm text-primary-foreground/95">{COPY_SITE.footer.about}</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Contato</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/95">
              <li>{SITE.legalName}</li>
              <li>CNPJ {SITE.cnpj}</li>
              <li>
                {SITE.city}/{SITE.state}
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {SITE.email}
                </a>
              </li>
              {whatsappConfigurado() && (
                <li>
                  <a
                    href={montarLinkWhatsApp(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              <li>
                <Link href="/acompanhar" className="underline-offset-4 hover:underline">
                  Acompanhar pedido
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/95 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ManageCookiesButton />
          </div>
        </div>
        <div className="mt-6 border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground/85">
          © {year} {SITE.legalName}. Todos os direitos reservados. · {SITE.domain}
        </div>
      </div>
    </footer>
  );
}
