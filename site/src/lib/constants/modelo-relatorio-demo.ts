/**
 * Modelo ilustrativo — dados 100% fictícios / anonimizados (LGPD).
 * Mesma estrutura de seções do PDF entregue ao cliente.
 */

import { TITULO_RELATORIO_PDF } from "@/lib/constants/estrutura-relatorio";

export const MODELO_RELATORIO_META = {
  referencia: "REL-2026-042",
  dataEmissao: "maio de 2026",
  area: "Prestação de serviços digitais — suspensão de conta",
  titulo: TITULO_RELATORIO_PDF,
  aviso: "Modelo ilustrativo com dados fictícios — não representa um caso real.",
} as const;

export const MODELO_RELATORIO_SECOES = [
  {
    titulo: "Destinatário e finalidade",
    corpo: `Relatório de pesquisa documental sobre o caso descrito pelo solicitante (neste modelo: referência interna **Cliente A.P.**, dados fictícios).\n\nOrganizamos o que foi narrado, o que a legislação costuma envolver em situações parecidas e o que tribunais já decidiram em casos semelhantes — para leitura e entendimento. Não indicamos se deve contratar advogado(a), ajuizar ação ou qualquer outro passo; essa decisão é exclusivamente sua.`,
  },
  {
    titulo: "Resumo executivo dos fatos (narrativa do cliente)",
    corpo: `Profissional autônomo relata suspensão reiterada de conta em plataforma digital de comunicação, após uso de funcionalidades oficiais do próprio serviço (incluindo vinculação a perfil corporativo).\n\nApós recurso interno, o fornecedor teria reconhecido ausência de irregularidade e restabelecido o acesso, com nova suspensão em seguida. Cliente alega prejuízo à atividade profissional. **Dados pessoais, capturas e identificadores permanecem apenas no dossiê contratual — não reproduzidos neste modelo público.**`,
  },
  {
    titulo: "Linha do tempo (organização cronológica)",
    corpo: `1. Bloqueio inicial após tentativa de pareamento de dispositivo.\n2. Análise interna da plataforma com resultado favorável ao usuário.\n3. Reativação seguida de novo bloqueio automático.\n4. Migração entre modalidades do aplicativo sem cessação do problema.\n5. Início de registro de provas (capturas) para eventual instrução — armazenadas sob sigilo contratual.`,
  },
  {
    titulo: "Fundamentos jurídicos frequentes em casos similares (referência bibliográfica)",
    corpo: `• Art. 14 do CDC — falha na prestação de serviço.\n• Princípio do *venire contra factum proprium* (comportamento contraditório).\n• Art. 20 do Marco Civil da Internet — responsabilização e defesa do usuário.\n• Art. 20 da LGPD — explicação de decisões automatizadas, quando aplicável.\n• Tutela de urgência e astreintes (arts. 300 e 537 do CPC) — citados em jurisprudência, não avaliados neste relatório.`,
  },
  {
    titulo: "Casos semelhantes já decididos (amostra)",
    corpo: `**TJMT (2026) — bloqueio de WhatsApp Business**\nO que aconteceu: profissional teve a conta comercial bloqueada sem explicação clara.\nO que o juiz decidiu: suspender o serviço sem motivo adequado é falha na prestação e viola a boa-fé do consumidor.\nResultado: indenização de R$ 10 mil por danos morais.\nFonte: tjmt.jus.br (notícia institucional, mar/2026)\n\n**TJPR (2025) — plataforma digital**\nO que aconteceu: usuário contestou restrição de acesso em serviço contratado.\nO que o juiz decidiu: o fornecedor deve manter o serviço disponível; interrupção abusiva não é permitida.\nResultado: obrigação de fazer — restabelecer o acesso.\nFonte: jurisprudência pública TJPR\n\n**TJMA (2024) — conta em rede social**\nO que aconteceu: perfil bloqueado sem aviso prévio eficaz.\nO que o juiz decidiu: bloqueio sem contraditório fere direitos do consumidor digital.\nResultado: restabelecimento da conta e danos morais.\nFonte: tjma.jus.br\n\nNo relatório contratado, selecionamos os casos mais próximos dos seus fatos — com data, tribunal e link para conferência.`,
  },
  {
    titulo: "Síntese do que a pesquisa mostrou",
    corpo: `Nos casos documentados com fatos parecidos com os que você narrou, decisões públicas mostram que juízes e juízas costumam determinar o **restabelecimento do serviço**, com fundamento na legislação aplicável (CDC, Marco Civil e correlatos), e, em parte dos julgamentos, **indenização** pelos danos relatados.\n\nEssa síntese descreve o que a pesquisa encontrou em tribunais — não uma conclusão sobre o seu caso específico. Saber se esses precedentes se aplicam a você e se faz sentido **ingressar com uma ação na Justiça** é análise de um(a) **advogado(a) inscrito(a) na OAB**. A Lex Rocha não indica esse passo nem substitui essa avaliação; você pode levar este relatório a um profissional de sua escolha, se quiser.`,
  },
] as const;
