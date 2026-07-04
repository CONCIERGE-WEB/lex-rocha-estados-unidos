/**
 * Blocos fixos de sistema (não gerados por IA por relatório).
 * Parte 2 da spec de triagem + fontes.
 */

/** Aparece logo abaixo da lista de links em todo relatório. */
export const BLOCO_FONTES_CONFERENCIA_CURTO = `**Sobre as fontes acima:** os precedentes indicados foram selecionados por tratarem da mesma categoria e tipo de situação descritos neste relatório. Recomendamos a leitura do inteiro teor de cada decisão diretamente no link oficial antes de qualquer providência, pois o texto completo pode conter detalhes factuais e fundamentações que um resumo não reproduz integralmente. Este relatório tem natureza informativa e estatística sobre padrões de decisões judiciais; não individualiza aconselhamento jurídico nem garante resultado.`;

/**
 * Versão estendida para política/termos (Módulo 8).
 * Revisar com profissional habilitado antes de publicar no site.
 */
export const BLOCO_FONTES_POLITICA_ESTENDIDO = `A Lex Rocha organiza e apresenta, de forma acessível, informações públicas sobre decisões judiciais e fundamentos legais associados a categorias recorrentes de casos de consumo. As decisões citadas são selecionadas com base em critérios de semelhança temática e situacional, e os links de acesso direcionam às fontes oficiais dos tribunais ou a repositórios públicos de jurisprudência.

Por se tratar de conteúdo informativo — e não de consultoria jurídica individualizada —, recomendamos que o usuário consulte o inteiro teor de cada decisão antes de tomar qualquer decisão baseada neste relatório, já que apenas o texto integral de uma decisão judicial permite avaliar com precisão as circunstâncias específicas que levaram àquele resultado. A Lex Rocha se compromete a manter as fontes indicadas atualizadas e revisadas periodicamente, mas não garante que os precedentes apresentados se apliquem automaticamente a qualquer situação individual, tampouco assegura resultado judicial específico para o usuário.`;

export function anexarBlocoFontesConferencia(listaLinks: string): string {
  return `${listaLinks}\n\n${BLOCO_FONTES_CONFERENCIA_CURTO}\n`;
}
