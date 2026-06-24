import { CtaBand } from "@/components/cta-band";
import { DeliveryCommitmentBand } from "@/components/delivery-commitment-band";
import { ExemploRelatorio } from "@/components/exemplo-relatorio";
import { ExpertiseBand } from "@/components/expertise-band";
import { FaqSection } from "@/components/faq-section";
import { HomeHero } from "@/components/home-hero";
import { PartnersSection } from "@/components/partners-section";
import { PricingSection } from "@/components/pricing-section";
import { PublicSourcesSection } from "@/components/public-sources-section";
import { SiteHeader } from "@/components/site-header";
import { SolutionGrid } from "@/components/solution-grid";
import { StatsBar } from "@/components/stats-bar";
import { TriagemSection } from "@/components/triagem-section";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { COPY } from "@/lib/constants/copy-en";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="content">
        <HomeHero />
        <StatsBar />

        {/* Problem → relief */}
        <section className="border-b border-ink/8 bg-folio py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="section-eyebrow">{COPY.dor.eyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
                  {COPY.dor.title}
                </h2>
              </div>
              <p className="whitespace-pre-line text-lead leading-relaxed text-muted">{COPY.dor.lead}</p>
            </div>
          </div>
        </section>

        <SolutionGrid />

        {/* Benefits */}
        <section className="border-b border-ink/8 bg-folio py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <p className="section-eyebrow">{COPY.valor.eyebrow}</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-ink md:text-4xl">
              {COPY.valor.title}
            </h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {COPY.valor.items.map((item, i) => (
                <li key={item.title} className="feature-card">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cite font-mono text-sm font-semibold text-trust">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-body leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Report includes */}
        <section className="section-muted border-b border-ink/8 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div>
                <p className="section-eyebrow">{COPY.relatorioInclui.eyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
                  {COPY.relatorioInclui.title}
                </h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {COPY.relatorioInclui.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-lg border border-ink/8 bg-folio px-4 py-3 text-sm text-ink shadow-sm"
                  >
                    <span className="font-bold text-verify" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="scroll-mt-24 border-b border-ink/8 bg-folio py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <p className="section-eyebrow">{COPY.exclusividade.eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-4xl">
              {COPY.exclusividade.title}
            </h2>

            <ol className="mt-12 grid gap-4 md:grid-cols-2">
              {COPY.exclusividade.passos.map((passo, i) => (
                <li
                  key={passo.titulo}
                  className="feature-card flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="font-mono text-3xl font-medium text-trust/30"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-cite px-3 py-1 font-mono text-xs uppercase tracking-wider text-trust">
                      {passo.tempo}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">{passo.titulo}</h3>
                  <p className="mt-2 flex-1 text-body leading-relaxed text-muted">{passo.detalhe}</p>
                </li>
              ))}
            </ol>

            <aside className="cite-block mt-10 rounded-xl md:mt-12 md:p-8" aria-labelledby="nota-servico">
              <p className="cite-label">{COPY.notaProfissional.eyebrow}</p>
              <h3 id="nota-servico" className="mt-3 font-display text-xl font-semibold text-ink">
                {COPY.notaProfissional.title}
              </h3>
              <p className="mt-3 text-body font-medium text-ink">{COPY.notaProfissional.lead}</p>
              <ul className="mt-4 space-y-2 text-body text-muted">
                {COPY.notaProfissional.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-trust" aria-hidden="true">
                      ·
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-muted">
                {COPY.notaProfissional.fecho}{" "}
                <a href="/terms" className="font-medium text-trust underline underline-offset-4">
                  Terms
                </a>{" "}
                ·{" "}
                <a href="/privacy" className="font-medium text-trust underline underline-offset-4">
                  Privacy
                </a>
              </p>
            </aside>
          </div>
        </section>

        <ExpertiseBand />
        <DeliveryCommitmentBand />
        <PublicSourcesSection />
        <ExemploRelatorio />

        {/* Trust */}
        <section className="section-muted border-b border-ink/8 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <p className="section-eyebrow">{COPY.garantias.eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink md:text-3xl">
              {COPY.garantias.title}
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {COPY.garantias.items.map((g) => (
                <li key={g.titulo} className="feature-card !p-5">
                  <p className="font-display text-base font-semibold text-trust">{g.titulo}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{g.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <TriagemSection />
        <PricingSection />
        <PartnersSection />
        <CtaBand />
        <FaqSection />
      </main>
      <WhatsAppFloat />
    </>
  );
}
