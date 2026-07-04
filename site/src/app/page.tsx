import { AreasAtendidasSection } from "@/components/organisms/areas-atendidas-section";
import { AvisoLegalSite } from "@/components/organisms/aviso-legal-site";
import { CtaBanner } from "@/components/organisms/cta-banner";
import { FontesPublicasSection } from "@/components/organisms/fontes-publicas-section";
import { HeroSection } from "@/components/organisms/hero-section";
import { HowItWorksSection } from "@/components/organisms/how-it-works-section";
import { ModeloRelatorioSection } from "@/components/organisms/modelo-relatorio-section";
import { PartnersWaitlistSection } from "@/components/organisms/partners-waitlist-section";
import { PrecosPesquisaSection } from "@/components/organisms/precos-pesquisa-section";
import { PrecedentesSection } from "@/components/organisms/precedentes-section";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { TrustSection } from "@/components/organisms/trust-section";
import { WhatsAppFloat } from "@/components/organisms/whatsapp-float";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-hidden">
        <HeroSection />
        <AreasAtendidasSection />
        <HowItWorksSection />
        <ModeloRelatorioSection />
        <TrustSection />
        <FontesPublicasSection />
        <PrecosPesquisaSection />
        <PrecedentesSection />
        <PartnersWaitlistSection />
        <CtaBanner />
      </main>
      <AvisoLegalSite />
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
