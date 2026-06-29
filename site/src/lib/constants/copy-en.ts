import { EMPRESA } from "./empresa";

export const COPY = {
  meta: {
    title: `${EMPRESA.marca} — Do you have a case against a company?`,
    description:
      "Describe what happened. We research similar U.S. cases and explain it in plain English — free analysis, pay only if you want the report.",
  },

  hero: {
    eyebrow: "Consumer rights · United States",
    title: "You have a problem with a company. You want to know if you're in the right.",
    subtitle:
      "We research real U.S. cases and explain what happened in situations like yours — in language you understand, without the runaround.",
    ctaPrimary: "Describe my case →",
    ctaSecondary: "See how it works",
    trustChips: [
      "Free analysis — pay only if you want the report",
      "Exact price shown before you pay",
      "Human-reviewed report — typically within 24 business hours",
    ],
    trustLine:
      "If we can't find documented similar cases, we'll tell you before asking for any payment. Every paid report is reviewed by a human before we email it.",
  },

  dor: {
    eyebrow: "Sound familiar?",
    title: "You've tried to resolve it. You still don't know where you stand.",
    lead:
      "The company responded with vague answers. You searched online and found conflicting opinions. You're not sure if what happened to you is normal or if you're entitled to more.\n\nThat's what this service is for.",
  },

  valor: {
    eyebrow: "What you get",
    title: "A report that answers the right questions",
    items: [
      {
        title: "Your situation, clearly recognized",
        text: "It starts with your case — described clearly, so you know we understand what happened.",
      },
      {
        title: "What has already been decided in similar cases",
        text: "Real cases, already decided in the U.S., in situations similar to yours. With outcomes.",
      },
      {
        title: "What those cases were granted",
        text: "The concrete relief consumers actually obtained in documented similar cases — refunds, damages, cancellations. Reported as research, never as a promise or recommendation.",
      },
    ],
  },

  relatorioInclui: {
    eyebrow: "The report",
    title: "What the report includes",
    items: [
      "Your case explained in plain language",
      "What U.S. consumer law says about your situation",
      "Similar cases already decided — and what was granted",
      "The concrete relief obtained in those documented cases",
      "Identified sources (court and date — no links)",
      "Research only — no recommendations or legal advice",
    ],
  },

  exclusividade: {
    eyebrow: "How it works",
    title: "How it works — no surprises along the way",
    passos: [
      {
        titulo: "Describe what happened",
        detalhe:
          "No complicated forms. Write it like you'd tell a friend — we'll figure out the rest.",
        tempo: "~2 min",
      },
      {
        titulo: "We cross-reference your case",
        detalhe:
          "Research tools scan public U.S. decisions similar to your situation — this free step takes only a few minutes.",
        tempo: "A few minutes",
      },
      {
        titulo: "You see the plan and exact price",
        detalhe:
          "We recommend a plan and show the fixed dollar amount. You decide whether to proceed — no charge until you choose.",
        tempo: "Your decision",
      },
      {
        titulo: "Human review, then email delivery",
        detalhe:
          "After payment, a human specialist reviews the research draft, verifies it fits your case, and sends the final report by email. Typical timing depends on current availability (shown before you pay).",
        tempo: "24–48 business hours",
      },
    ],
  },

  garantias: {
    eyebrow: "Transparency",
    title: "What you can expect from us",
    items: [
      {
        titulo: "Before you pay",
        texto:
          "You only pay if the analysis finds documented similar cases and you want to proceed.",
      },
      {
        titulo: "What we use",
        texto: "Not opinions. Public U.S. decisions already on record.",
      },
      {
        titulo: "How we explain",
        texto: "We explain what the law says in plain language. Nothing left unexplained.",
      },
      {
        titulo: "If there's no basis",
        texto:
          "If we don't have enough documented basis for your case, we'll say so. Even if that means we don't get paid.",
      },
    ],
  },

  notaProfissional: {
    eyebrow: "Scope",
    title: "Informational report — not legal representation",
    lead: "We organize and explain what public documentation says about your case.",
    bullets: [
      "We don't represent you in court or before companies",
      "We don't issue binding legal opinions",
      "The report supports your decision — the final choice is always yours",
    ],
    fecho: "Investment visible before payment.",
  },

  planos: {
    eyebrow: "Plans",
    title: "The exact price appears before you pay.",
    intro: "The free analysis indicates what makes the most sense.",
    notaFiscal:
      "Payment in USD · Stripe receipt · informational service (see Terms).",
    avisoTransparencia:
      "This report is informational — it does not replace legal advice. For complex cases or high amounts, consider also speaking with an attorney.",
    cta: "Start free analysis →",
    ctaCard: "Start free analysis →",
    destaque: "Most popular",
  },

  triagem: {
    eyebrow: "Start here",
    title: "Find out where your case stands",
    intro:
      "Three short steps. The analysis is free — you only pay if you want the full report, with the exact price at checkout.",
    passosLabel: ["Area", "Your case", "Recommendation"],
    passo1: {
      label: "What area is the problem in?",
      hint: "One choice — less than 15 seconds.",
      botao: "Continue",
    },
    passo2: {
      label: "What happened?",
      hint: "Company, dates, and what you've already tried. Use your own words — minimum 80 characters.",
      placeholder:
        "E.g.: In March I bought online. The product arrived defective. The store has refused a return for 3 weeks…",
      botao: "Analyze for free",
      voltar: "Back",
    },
    passo3: {
      aCarregar: "Analyzing your case…",
      aCarregarHint:
        "Cross-referencing public records — usually under two minutes. You'll then see your recommended plan, exact price, and current delivery availability.",
      planoLabel: "Recommended plan · exact price at checkout",
      confianca: "Screening confidence",
      semSurpresas: "This is the exact amount if you proceed — no hidden fees.",
      entregaTitulo: "If you proceed today",
      entregaNota:
        "Delivery timing follows the availability status below. Every report is human-reviewed before email — never sent automatically by software alone.",
      ctaPagar: "Proceed to secure payment",
      ctaAvancar: "Proceed anyway",
      ctaHonestidade: "I appreciate the honesty",
      avisoFraco: "Precedents found are limited — the report will include that caveat.",
      novoCaso: "New case",
      contactoAntes: "Prefer to talk first?",
    },
    rodape:
      "Personalized digital service. After execution begins, refund rights may be limited under applicable state law.",
  },

  contacto: {
    title: "Have a question before proceeding?",
    lead: "We respond on business days. For case analysis, use the main form — it's faster.",
    whatsapp: "Quick question via WhatsApp",
    whatsappHint: "Reply on your phone — ideal for quick questions before requesting the report.",
    confirmacao: "Message received. We'll respond on business days.",
    enviar: "Send message",
    aEnviar: "Sending…",
  },

  obrigado: {
    title: "Payment confirmed — thank you",
    lead: "Your order is registered. We're preparing the report based on the description you sent.",
    trackingLabel: "Your tracking code",
    trackingHint: "Save this code to check status anytime at Track order.",
    passos: [
      "Check your email for the receipt (it may go to spam)",
      "A human specialist reviews your report — typical delivery within 24 business hours (Mon–Fri)",
      "Save the document: it's the basis for your next step with the company",
    ],
    cta: "Back to home",
    trackCta: "Track my order",
  },

  track: {
    title: "Track your order",
    intro: "Enter the 8-character code from your confirmation email or thank-you page.",
    formTitle: "Look up order",
    placeholder: "Tracking code (e.g. AB12CD34)",
    submit: "Check status",
    loading: "Looking up…",
    notFound: "Order not found. Check the code and try again.",
    newRequest: "Start a new analysis",
    estimateNote:
      "Delivery estimates reflect business hours and human review time. Status updates when your report is being reviewed or has been emailed.",
  },

  delivery: {
    eyebrow: "Timelines & availability",
    title: "Clear timing — like professional services you already trust",
    lead:
      "Free screening is fast. Paid reports take longer because a human reviews every line before we email you — the same pattern used by major legal and tax platforms.",
    phases: [
      {
        title: "Free screening",
        detail: "You describe your case. We cross-reference public U.S. records and show a recommended plan with the exact price.",
        timing: "~2 minutes",
      },
      {
        title: "Your decision",
        detail: "You choose whether to pay. Current queue availability is shown so you know what to expect before checkout.",
        timing: "Immediate",
      },
      {
        title: "Human review & delivery",
        detail: "After payment, a specialist verifies the research draft against your facts and sends the final report by email.",
        timing: "Typically 24 business hours (up to 48 when busy)",
      },
    ],
    footnote:
      "Business hours = Monday–Friday, excluding U.S. federal holidays. WhatsApp messages are answered separately, as soon as we can.",
  },

  reportSample: {
    title: "Sample research report",
    intro:
      "Illustrative structure only — your report is tailored to your case and based on real U.S. public records.",
    ctaStart: "Start free analysis",
    ctaWhatsapp: "Question via WhatsApp",
  },

  sources: {
    eyebrow: "Transparency",
    title: "Public sources we consult",
    description:
      "We research documented U.S. consumer rights information — not opinions from forums.",
  },

  partners: {
    eyebrow: "Partner program",
    title: "Attorneys & consumer advocates",
    description:
      "Structured case summaries and research reports — so your team spends less time on initial triage.",
    badge: "Waitlist — limited regions",
    cta: "Join the waitlist",
    pageTitle: "Partner waitlist — law firms",
    pageIntro:
      "We're building a referral program for U.S. attorneys who want pre-researched consumer cases.",
    benefits: [
      "Leads with documentary research and plain-language case summaries",
      "Less time on initial fact-gathering",
      "Commercial terms in development — limited spots by region",
    ],
    mailtoSubject: "Partner waitlist — Judicial Intelligence",
    mailtoCta: "Request a waitlist spot",
    mailtoNote:
      "Automated partner signup comes in a later phase. For now, email us with your firm name and state.",
    cards: [
      {
        title: "Pre-screened cases",
        text: "Clients arrive with structured facts and similar-case research already done.",
      },
      {
        title: "Regional focus",
        text: "We prioritize states where our research pipeline is strongest.",
      },
      {
        title: "Clear scope",
        text: "Informational reports only — you retain representation and strategy.",
      },
    ],
  },

  cookie: {
    texto:
      "Essential cookies for the site to work. With your consent, we may use analytics to improve the experience.",
    rejeitar: "Essential only",
    aceitar: "Accept all",
  },

  nav: {
    como: "How it works",
    planos: "Pricing",
    contacto: "Contact",
    login: "Sign in",
    cta: "Describe case",
    support: "Support",
    sampleReport: "Sample report",
    sources: "Public sources",
    partners: "Partners",
    track: "Track order",
    forAttorneys: "For attorneys",
    request: "Start analysis",
  },

  topBar: {
    tagline: "Independent consumer-rights research · United States",
  },

  stats: [
    { value: "24h", label: "Typical delivery after payment (business hours)" },
    { value: "$29–59", label: "Fixed plans — exact price before checkout" },
    { value: "Human", label: "Specialist review before every report" },
    { value: "Free", label: "Initial case screening (~2 min)" },
  ],

  solutions: {
    eyebrow: "What we research",
    title: "Consumer situations we clarify every day",
    lead:
      "From billing disputes to warranty denials — we map your case against real U.S. outcomes.",
    items: [
      {
        title: "Billing & subscriptions",
        text: "Unauthorized charges, auto-renewals, refund delays, and recurring billing disputes.",
        icon: "billing",
      },
      {
        title: "Online shopping & retail",
        text: "Defective products, delivery failures, return refusals, and misleading listings.",
        icon: "retail",
      },
      {
        title: "Telecom & utilities",
        text: "Wireless, internet, cable, electric, and water service complaints.",
        icon: "telecom",
      },
      {
        title: "Banking & credit",
        text: "Credit card errors, loan servicing, debt collection, and account disputes.",
        icon: "bank",
      },
    ],
  },

  expertise: {
    eyebrow: "Our approach",
    title: "Consumer law is complex. We clarify it.",
    lead:
      "Like enterprise legal intelligence — technology speeds research; humans review and deliver every report.",
    cards: [
      {
        title: "Research, not opinions",
        text: "We cross-reference your facts with documented U.S. cases — not forum anecdotes.",
      },
      {
        title: "Plain-language delivery",
        text: "Your report explains what U.S. law says and what similar cases were actually granted — plain facts, no advice.",
      },
      {
        title: "Transparent before payment",
        text: "Free screening first. You only pay if you want the full report — price locked at checkout.",
      },
    ],
    cta: "Explore how it works",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Common questions",
    items: [
      {
        q: "Is this legal advice?",
        a: "No. We deliver an informational research report based on public records. For representation or binding opinions, consult a licensed attorney.",
      },
      {
        q: "What if you don't find similar cases?",
        a: "We'll tell you before asking for payment. The free analysis is designed to surface that honestly.",
      },
      {
        q: "How fast do I receive the report?",
        a: "After payment, a human specialist reviews your report before we email it. When our queue is open, most clients receive it within 24 business hours (Mon–Fri). During high volume, it may take up to 48 business hours — you'll see current availability before you pay.",
      },
      {
        q: "Does AI write and send my report automatically?",
        a: "No. Research tools help gather public records, but a human reads, checks, and assembles your report. Nothing is sent without that review.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "Secure card checkout via Stripe in USD. You'll receive a digital receipt by email.",
      },
    ],
  },

  ctaBand: {
    title: "Ready to see where your case stands?",
    lead: "Start with a free analysis — no payment required until you choose a plan.",
    primary: "Start free analysis",
    secondary: "View plans",
  },

  footer: {
    tagline: "Independent documentary research on U.S. consumer rights.",
    disclaimer:
      `${EMPRESA.marca} provides independent, informational consumer-rights research based on public records. It is not a law firm and does not provide legal advice or representation. Using this site or reading a report does not create an attorney-client relationship, and your communications are not protected by attorney-client privilege. Laws change and vary by state; every case turns on its own facts. The final decision in any matter is always yours.`,
    columns: {
      product: "Product",
      company: "Company",
      legal: "Legal",
    },
    links: {
      howItWorks: "How it works",
      plans: "Pricing",
      start: "Start analysis",
      sampleReport: "Sample report",
      track: "Track order",
      partners: "For attorneys",
      contact: "Contact",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookies: "Cookie policy",
      manageCookies: "Manage cookies",
    },
  },
} as const;
