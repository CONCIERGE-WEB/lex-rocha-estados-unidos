/**
 * Textos públicos Lex-Rocha — fonte única de verdade.
 *
 * Copy alinhado ao modelo juridicamente cuidadoso do Judicial Intelligence,
 * traduzido para pt-BR e localizado para o United States (CDC, Marco Civil, LGPD,
 * tribunais brasileiros, pagamento em R$).
 *
 * Estratégia (neurocomportamental · ver docs/PROMPT_ADAPTACAO_NEUROCOMPORTAMENTAL.md):
 * - Clareza cognitiva: uma ideia por bloco.
 * - Hierarquia: valor → processo → metodologia → investimento → ação.
 * - Confiança: escopo, preço e limites antes do clique.
 * - Conformidade: pesquisa documental informativa; sem aconselhamento, sem
 *   promessa de resultado; não substitui advogado(a) OAB; não cria relação
 *   advogado-cliente.
 * - Vertical TI: LGPD, plataformas, consumo e contratos digitais (demanda A1–A4).
 *
 * Regras .cursorrules: sem consultoria, sem prometer resultado, sem “gratuito”/MVP.
 */

/** Frases banidas em produção (auditoria / testes). */
export const COPY_PROIBIDO = [
  "MVP — primeiros relatórios gratuitos",
  "Saiba se você tem direito",
  "Bloqueado no WhatsApp",
  "estamos aqui para ajudar",
  "não só bloqueios",
  "momento de stress",
  "Fui lesado",
  "análise gratuita",
  "inteligência artificial",
] as const;

/** Categorias do nicho digital — alinhadas ao formulário e à seção Escopo */
export const COPY_CATEGORIAS_DIGITAL = [
  { id: "A1", label: "LGPD, vazamento e uso indevido de dados" },
  { id: "A2", label: "Contas, apps e plataformas digitais" },
  { id: "A3", label: "Consumo digital (apps, fintech, marketplaces)" },
  { id: "A4", label: "Contratos digitais, SaaS e cancelamentos" },
  { id: "B1", label: "Trabalho com uso de tecnologia (apps, monitoramento)" },
  { id: "B2", label: "Planos de saúde e negativas de cobertura" },
  { id: "C", label: "Demais questões cíveis com uso de tecnologia" },
] as const;

export const COPY_SITE = {
  metadata: {
    defaultTitle: "Judicial Intelligence — Você tem um caso contra uma empresa?",
    description:
      "Descreva o que aconteceu. Pesquisamos casos brasileiros semelhantes já decididos e explicamos em linguagem clara o que os tribunais entenderam. Triagem inicial sem cobrança.",
    ogDescription:
      "Casos reais explicados em português claro — o que aconteceu, o que o juiz decidiu e o que foi concedido. Relatório revisado por uma pessoa antes do envio.",
    keywords: [
      "pesquisa jurisprudência",
      "direito digital",
      "LGPD precedentes",
      "conta bloqueada plataforma",
      "precedentes públicos",
      "relatório documental",
      "direito do consumidor digital",
      "organização jurídica",
    ],
  },
  hero: {
    badge: "Pesquisa de precedentes · direito do consumidor",
    title: "Você tem um problema com uma empresa e quer saber",
    titleHighlight: "se a razão está com você.",
    lead:
      "Pesquisamos casos reais já decididos no United States e explicamos o que aconteceu em situações como a sua — em linguagem que você entende, sem enrolação.",
    scope:
      "A triagem inicial é sem cobrança. Se não encontrarmos casos semelhantes documentados, avisamos antes de qualquer pagamento. Escopo e valor confirmados por escrito.",
    ctaPrimary: "Descrever meu caso",
    ctaSecondary: "Ver como funciona",
    ctaWhatsapp: "WhatsApp",
    footnote:
      "Valor exato exibido antes de pagar · a partir de R$ {essencial} · relatório revisado por uma pessoa, normalmente em até 24h úteis",
    whatsappMensagem:
      "Olá! Acessei o site {domain} e quero descrever meu caso para uma pesquisa de precedentes.",
  },
  areas: {
    eyebrow: "O que pesquisamos",
    title: "Situações de consumo que esclarecemos",
    description:
      "Da cobrança indevida à negativa de garantia — mapeamos o seu caso contra decisões reais já proferidas no United States. A lista orienta o pedido; o escopo final segue o que você descrever na solicitação:",
    lista: COPY_CATEGORIAS_DIGITAL.map((c) => c.label),
  },
  howItWorks: {
    eyebrow: "Como funciona",
    title: "Como funciona — sem surpresas no caminho",
    description:
      "Você sabe o que acontece em cada etapa, sem surpresa na cobrança.",
    steps: [
      {
        title: "1. Descreva o que aconteceu",
        description:
          "Sem formulários complicados. Escreva como você contaria a um amigo — cuidamos do resto. Leva cerca de 2 minutos.",
      },
      {
        title: "2. Cruzamos o seu caso e mostramos o valor exato",
        description:
          "Cruzamos os seus fatos com precedentes e legislação de fontes públicas — triagem automatizada e pesquisa humana nos portais indicados. Você vê o plano recomendado e o valor fixo, sem cobrança até decidir.",
      },
      {
        title: "3. Revisão humana e entrega",
        description:
          "Após o pagamento, um especialista revisa a pesquisa, confere se corresponde ao seu caso e envia o relatório final por e-mail. O prazo segue a disponibilidade atual, informada antes de pagar.",
      },
    ],
  },
  modelo: {
    eyebrow: "The report",
    title: "Illustrative research report model",
    description:
      "Same anatomy as the paid U.S. deliverable — public records only, never invented cases. Adapted for American consumer statutes and CourtListener-sourced opinions.",
    cta: "Open full sample",
    pageTitle: "Sample report model",
    pageIntro:
      "See how the report explains a case: practical results observed, your facts, timeline, what U.S. law says, similar decided cases, a Premium requirements matrix, and transparent sources.",
    ctaSolicitar: "Start analysis",
    ctaWhatsapp: "WhatsApp questions",
    whatsappMensagem:
      "Hi! I saw the sample report on {domain} and would like to request research.",
  },
  trust: {
    eyebrow: "Transparência",
    title: "O que você pode esperar de nós",
    description:
      "Como a inteligência jurídica corporativa: a tecnologia acelera a pesquisa; pessoas revisam e entregam cada relatório.",
    pillars: [
      {
        title: "Investimento visível antes de pagar",
        text: "O valor exato aparece antes do pagamento — sem taxas escondidas.",
      },
      {
        title: "Prazo informado antes de pagar",
        text: "Você vê a disponibilidade atual da fila antes do checkout.",
      },
      {
        title: "Pesquisa, não opiniões",
        text: "Cruzamos os seus fatos com decisões públicas documentadas — não com achismos de fórum.",
      },
      {
        title: "Linguagem clara",
        text: "Traduzimos o que os tribunais decidiram em situações parecidas — sem juridiquês desnecessário.",
      },
      {
        title: "Se não houver base, a gente avisa",
        text: "Se não houver base documentada suficiente para o seu caso, dizemos isso — mesmo que signifique não receber.",
      },
    ],
  },
  fontes: {
    eyebrow: "Transparência",
    title: "Fontes públicas que consultamos",
    description:
      "Pesquisamos informações documentadas de direito do consumidor — não opiniões de fóruns. Cada referência pode ser conferida por você nos portais indicados.",
  },
  precos: {
    eyebrow: "Como definimos o plano",
    title: "Analisamos o seu caso e apresentamos as opções.",
    description:
      "Você descreve o que aconteceu e nós pesquisamos. Conforme o que o seu caso comporta, apresentamos o plano adequado — Essencial, Padrão ou Completo. O valor exato aparece antes de qualquer pagamento. Pagamento em R$ via Stripe · serviço informativo (ver Termos).",
    linkModelo: "Ver modelo ilustrativo (dados fictícios)",
    semPrecedentesSelo: "R$ 0 · sem cobrança",
    semPrecedentesTitulo: "Caso inédito? Sem precedente comparável no United States, você não paga.",
    semPrecedentesTexto:
      "Se a nossa pesquisa não localizar decisão semelhante à sua já julgada no United States, não há cobrança. Mesmo assim, você recebe o que foi pesquisado e os fundamentos legais aplicáveis, com o cenário explicado de forma clara.",
  },
  precedentes: {
    eyebrow: "Exemplos reais",
    title: "O que os tribunais já decidiram em casos parecidos",
    description:
      "Não é lista de links — explicamos o que aconteceu, o que o juiz entendeu e o que foi concedido. No seu relatório, selecionamos os casos mais próximos da sua situação.",
    notaAmostra:
      "Amostra ilustrativa de decisões públicas. Cada caso é diferente — o relatório contratado traz os precedentes selecionados para os seus fatos.",
  },
  parceiros: {
    eyebrow: "Programa de parceiros",
    title: "Advogados e defensores do consumidor",
    description:
      "Resumos de casos estruturados e relatórios de pesquisa — para a sua equipe gastar menos tempo na triagem inicial.",
    cards: [
      {
        title: "Casos pré-triados",
        text: "Os clientes chegam com fatos estruturados e a pesquisa de casos semelhantes já feita.",
      },
      {
        title: "Foco regional",
        text: "Priorizamos regiões onde a nossa pesquisa é mais consistente.",
      },
      {
        title: "Escopo claro",
        text: "Relatórios informativos apenas — você mantém a representação e a estratégia.",
      },
    ],
    badge: "Lista de espera — vagas limitadas por região",
    cta: "Entrar na lista de espera",
  },
  cta: {
    title: "Pronto para saber onde o seu caso está?",
    description:
      "Comece pela triagem sem cobrança — nenhum pagamento até você escolher um plano.",
    primary: "Começar triagem",
    whatsappMensagem:
      "Olá! Gostaria de descrever meu caso para uma pesquisa de precedentes — vim pelo site {domain}.",
  },
  footer: {
    about:
      "Pesquisa documental de jurisprudência pública sobre direito do consumidor. Organizamos o que os tribunais já decidiram em casos semelhantes ao seu — em linguagem que você entende.",
    whatsappMensagem:
      "Olá! Contato pelo site {domain} — pesquisa de precedentes.",
  },
  solicitar: {
    title: "Descreva seu caso",
    intro:
      "Conte o que aconteceu com o detalhe que tiver (empresa, datas e o que já tentou). Use suas próprias palavras. A triagem é sem cobrança — você só paga se quiser o relatório, com o valor exato no checkout.",
    sucessoTitulo: "Solicitação recebida",
    sucessoCorpo:
      "Vamos cruzar o seu caso com registros públicos e responder com o plano recomendado, o prazo e o valor exato antes de qualquer cobrança.",
    placeholderDescricao:
      "Ex.: Em março comprei online. O produto chegou com defeito. A loja recusa a troca há 3 semanas… (sem senhas nem dados bancários completos).",
    referenciaValores:
      "Faixas de referência: Essencial, Padrão e Completo. O valor final depende do escopo confirmado por escrito.",
  },
  acompanhar: {
    title: "Acompanhar pedido",
    intro:
      "Informe o código de 8 caracteres do e-mail de confirmação ou da página de obrigado.",
  },
  parceiro: {
    badge: "Lista de espera — escritórios",
    title: "Lista de espera — escritórios parceiros",
    intro:
      "Estamos montando um programa de encaminhamento para advogados que querem casos de consumo já pesquisados. Cadastre o nome do escritório e a região para ser contactado na abertura da rede.",
  },
  whatsappFloat: {
    mensagem:
      "Olá! Acessei {domain} e gostaria de informações sobre a pesquisa de precedentes.",
    label: "Falar no WhatsApp",
  },
  cookies: {
    dialogLabel: "Preferências de cookies",
    title: "Cookies e privacidade",
  },
  avisoLegal: {
    texto:
      "Judicial Intelligence organiza pesquisa em fontes públicas e não é escritório de advocacia. O relatório é informativo e não substitui advogado(a) — veja os",
    linkTermos: "Termos de uso",
  },
} as const;

/** @deprecated Use COPY_SITE — mantido para imports legados */
export const COPY_LANDING = COPY_SITE;
