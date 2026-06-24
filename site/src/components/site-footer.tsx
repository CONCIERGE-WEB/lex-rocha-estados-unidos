import { BrandLogo } from "@/components/brand-logo";
import { ManageCookiesButton } from "@/components/manage-cookies-button";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { whatsappUrl } from "@/lib/constants/pagamentos";

export function SiteFooter() {
  const ano = new Date().getFullYear();
  const F = COPY.footer;
  const wa = whatsappUrl();

  return (
    <footer className="bg-ink text-onDark">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <BrandLogo variant="dark" />
            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-onDarkMuted">
              {F.tagline}
            </p>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
              {F.columns.product}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <a href="/#como-funciona" className="text-onDark transition hover:underline">
                  {F.links.howItWorks}
                </a>
              </li>
              <li>
                <a href="/report-sample" className="text-onDark transition hover:underline">
                  {F.links.sampleReport}
                </a>
              </li>
              <li>
                <a href="/#sources" className="text-onDark transition hover:underline">
                  {COPY.nav.sources}
                </a>
              </li>
              <li>
                <a href="/#planos" className="text-onDark transition hover:underline">
                  {F.links.plans}
                </a>
              </li>
              <li>
                <a href="/#pedir-relatorio" className="text-onDark transition hover:underline">
                  {F.links.start}
                </a>
              </li>
              <li>
                <a href="/track" className="text-onDark transition hover:underline">
                  {F.links.track}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
              {F.columns.company}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <a href="/partners" className="text-onDark transition hover:underline">
                  {F.links.partners}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-onDark transition hover:underline">
                  {F.links.contact}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMPRESA.emailContacto}`} className="text-onDark transition hover:underline">
                  {EMPRESA.emailContacto}
                </a>
              </li>
              {wa ? (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-onDark transition hover:underline"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
              {F.columns.legal}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <a href="/terms" className="text-onDark transition hover:underline">
                  {F.links.terms}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-onDark transition hover:underline">
                  {F.links.privacy}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-onDark transition hover:underline">
                  {F.links.cookies}
                </a>
              </li>
            </ul>
            <ManageCookiesButton />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-onDark/15 pt-8 text-xs font-medium text-onDarkMuted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {EMPRESA.marca}. All rights reserved.
          </p>
          <p>
            {EMPRESA.forma} · {EMPRESA.paisSede}
          </p>
        </div>
      </div>
    </footer>
  );
}
