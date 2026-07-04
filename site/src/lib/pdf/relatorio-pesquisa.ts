import { jsPDF } from "jspdf";

import { FONTES_PESQUISA_PUBLICA, NOTA_FONTES_RELATORIO } from "@/lib/constants/fontes-publicas";
import {
  AVISO_DESTAQUE_PDF,
  limparMarkdownPdf,
  parseSecoesRelatorio,
  SECOES_RELATORIO_ORDEM,
  textoDestinatarioFinalidade,
  TITULO_RELATORIO_PDF,
} from "@/lib/constants/estrutura-relatorio";
import { AVISO_LEGAL_RELATORIO } from "@/lib/constants/pesquisa-documental";
import { SITE } from "@/lib/constants/site";

export type DadosPdfPesquisa = {
  numeroReferencia?: string;
  numeroSequencial?: number;
  referenciaInterna?: string;
  area: string;
  conteudoGerado: string;
  dataEmissao?: Date;
  codigoAcompanhamento?: string;
  previsaoEntrega?: string;
};

const MARGEM = 18;
const LARGURA_UTIL = 174;
const ALTURA_PAGINA = 297;
const RODAPE_Y = 285;

const COR = {
  navy: [26, 42, 74] as [number, number, number],
  gold: [206, 157, 34] as [number, number, number],
  texto: [30, 41, 59] as [number, number, number],
  muted: [71, 85, 105] as [number, number, number],
  avisoFundo: [255, 251, 235] as [number, number, number],
};

function novaPaginaSePreciso(doc: jsPDF, y: number, minimo = 40): number {
  if (y > ALTURA_PAGINA - minimo) {
    doc.addPage();
    return MARGEM + 8;
  }
  return y;
}

function adicionarTexto(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  largura: number,
  tamanho = 10,
  estilo: "normal" | "bold" | "italic" = "normal"
): number {
  doc.setFont("helvetica", estilo);
  doc.setFontSize(tamanho);
  doc.setTextColor(...COR.texto);
  const linhas = doc.splitTextToSize(limparMarkdownPdf(texto), largura);
  doc.text(linhas, x, y);
  return y + linhas.length * (tamanho * 0.45);
}

function desenharCabecalhoPagina(doc: jsPDF, numero: string, area: string, dataStr: string) {
  doc.setFillColor(...COR.navy);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("LEX ROCHA", MARGEM, 10);
  doc.setFontSize(13);
  doc.text(TITULO_RELATORIO_PDF, MARGEM, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${numero} · ${area}`, MARGEM, 26);
  doc.text(dataStr, 210 - MARGEM, 26, { align: "right" });
}

function desenharSecao(doc: jsPDF, titulo: string, corpo: string, yInicio: number): number {
  let y = novaPaginaSePreciso(doc, yInicio, 50);

  doc.setDrawColor(...COR.gold);
  doc.setLineWidth(0.4);
  doc.line(MARGEM, y, MARGEM + 28, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COR.navy);
  const tituloLinhas = doc.splitTextToSize(titulo, LARGURA_UTIL);
  doc.text(tituloLinhas, MARGEM, y);
  y += tituloLinhas.length * 5.5 + 3;

  y = adicionarTexto(doc, corpo, MARGEM, y, LARGURA_UTIL, 10, "normal");
  return y + 8;
}

function desenharRodape(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COR.gold);
    doc.setLineWidth(0.2);
    doc.line(MARGEM, RODAPE_Y - 4, 210 - MARGEM, RODAPE_Y - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COR.muted);
    doc.text(
      `${SITE.legalName} · CNPJ ${SITE.cnpj} · ${SITE.domain} · Página ${i} de ${total}`,
      MARGEM,
      RODAPE_Y
    );
  }
}

export function gerarPdfRelatorioPesquisa(dados: DadosPdfPesquisa): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dataStr = (dados.dataEmissao ?? new Date()).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const numero =
    dados.numeroReferencia ??
    (dados.numeroSequencial
      ? `REL-${new Date().getFullYear()}-${String(dados.numeroSequencial).padStart(3, "0")}`
      : "RELATÓRIO");

  desenharCabecalhoPagina(doc, numero, dados.area, dataStr);
  let y = 40;

  if (dados.codigoAcompanhamento || dados.previsaoEntrega) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR.muted);
    const meta: string[] = [];
    if (dados.codigoAcompanhamento) meta.push(`Código de acompanhamento: ${dados.codigoAcompanhamento}`);
    if (dados.previsaoEntrega) {
      meta.push(
        `Previsão de entrega: ${new Date(dados.previsaoEntrega).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`
      );
    }
    doc.text(meta.join(" · "), MARGEM, y);
    y += 8;
  }

  doc.setFillColor(...COR.avisoFundo);
  doc.setDrawColor(...COR.gold);
  doc.setLineWidth(0.3);
  const avisoLinhas = doc.splitTextToSize(AVISO_DESTAQUE_PDF, LARGURA_UTIL - 8);
  const avisoAltura = avisoLinhas.length * 4 + 8;
  doc.roundedRect(MARGEM, y, LARGURA_UTIL, avisoAltura, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 10);
  doc.text(avisoLinhas, MARGEM + 4, y + 6);
  y += avisoAltura + 10;

  const secoesParseadas = parseSecoesRelatorio(dados.conteudoGerado);
  const destinatario = textoDestinatarioFinalidade(dados.referenciaInterna);

  y = desenharSecao(doc, "DESTINATÁRIO E FINALIDADE", destinatario, y);

  for (const tituloPadrao of SECOES_RELATORIO_ORDEM) {
    if (tituloPadrao === "DESTINATÁRIO E FINALIDADE") continue;
    const corpo = secoesParseadas.get(tituloPadrao);
    if (corpo) {
      y = desenharSecao(doc, tituloPadrao, corpo, y);
      secoesParseadas.delete(tituloPadrao);
    }
  }

  for (const [titulo, corpo] of Array.from(secoesParseadas.entries())) {
    if (titulo === "CONTEÚDO DA PESQUISA") {
      y = desenharSecao(doc, "PESQUISA DOCUMENTAL", corpo, y);
    } else {
      y = desenharSecao(doc, titulo, corpo, y);
    }
  }

  y = novaPaginaSePreciso(doc, y, 60);
  y = desenharSecao(doc, "FONTES PÚBLICAS CONSULTADAS (REFERÊNCIA)", NOTA_FONTES_RELATORIO, y);

  doc.setFontSize(8);
  for (const fonte of FONTES_PESQUISA_PUBLICA) {
    y = novaPaginaSePreciso(doc, y, 15);
    y = adicionarTexto(doc, `• ${fonte.nome}: ${fonte.url}`, MARGEM, y, LARGURA_UTIL, 8);
    y += 2;
  }

  y = novaPaginaSePreciso(doc, y, 40);
  doc.setDrawColor(...COR.gold);
  doc.line(MARGEM, y, 210 - MARGEM, y);
  y += 6;
  y = adicionarTexto(doc, "AVISO LEGAL", MARGEM, y, LARGURA_UTIL, 9, "bold");
  y += 2;
  y = adicionarTexto(doc, AVISO_LEGAL_RELATORIO, MARGEM, y, LARGURA_UTIL, 8, "italic");

  desenharRodape(doc);
  return doc.output("blob");
}

export function baixarPdfRelatorio(dados: DadosPdfPesquisa, nomeArquivo: string) {
  const blob = gerarPdfRelatorioPesquisa(dados);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
