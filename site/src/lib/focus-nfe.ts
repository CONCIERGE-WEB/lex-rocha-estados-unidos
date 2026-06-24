/** Cliente Focus NFe — emissão interna MEI (não exposta ao consumidor PT) */

export type EmitirNfseInput = {
  nomeCompleto: string;
  email: string;
  valorServicos: number;
  referencia: string;
  nifTomador?: string | null;
};

export type EmitirNfseResult = {
  focoId: string;
  numero: string | null;
  pdfUrl: string | null;
};

function baseUrl(): string {
  const homolog = process.env.FOCUS_NFE_HOMOLOGACAO === "true";
  return homolog ? "https://homologacao.focusnfe.com.br" : "https://api.focusnfe.com.br";
}

function authHeader(): string {
  const token = process.env.FOCUS_NFE_TOKEN;
  if (!token) throw new Error("FOCUS_NFE_TOKEN não configurado");
  return `Basic ${Buffer.from(`${token}:`).toString("base64")}`;
}

export function focusNfeConfigurado(): boolean {
  return Boolean(
    process.env.FOCUS_NFE_TOKEN?.trim() &&
      process.env.MEI_CNPJ?.trim() &&
      process.env.INSCRICAO_MUNICIPAL?.trim()
  );
}

export async function emitirNfse(input: EmitirNfseInput): Promise<EmitirNfseResult> {
  const cnpj = (process.env.MEI_CNPJ ?? "").replace(/\D/g, "");
  const inscricaoMunicipal = process.env.INSCRICAO_MUNICIPAL ?? "";
  const codigoMunicipio = process.env.MEI_CODIGO_MUNICIPIO ?? "3510500";

  const tomador: Record<string, string> = {
    razao_social: input.nomeCompleto,
    email: input.email,
    endereco_completo_exterior: "Portugal",
    codigo_pais: "6200",
  };

  if (input.nifTomador) {
    tomador.numero_documento = input.nifTomador;
    tomador.documento = "NIF";
  }

  const body = {
    data_emissao: new Date().toISOString().slice(0, 10),
    prestador: {
      cnpj,
      inscricao_municipal: inscricaoMunicipal,
      codigo_municipio: codigoMunicipio,
    },
    tomador,
    servico: {
      discriminacao:
        "Exportação de serviço digital de pesquisa documental em fontes públicas portuguesas",
      valor_servicos: input.valorServicos,
      item_lista_servico: process.env.NFSE_ITEM_LISTA ?? "17.01",
      aliquota: Number(process.env.NFSE_ALIQUOTA_ISS ?? "2.84"),
      iss_retido: false,
    },
    enviar_email_tomador: true,
  };

  const ref = input.referencia.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  const url = `${baseUrl()}/v2/nfse?ref=${encodeURIComponent(ref)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      typeof data.mensagem === "string"
        ? data.mensagem
        : typeof data.erros === "string"
          ? data.erros
          : JSON.stringify(data);
    throw new Error(`Focus NFe ${res.status}: ${msg}`);
  }

  return {
    focoId: String(data.ref ?? ref),
    numero: data.numero ? String(data.numero) : data.numero_nfse ? String(data.numero_nfse) : null,
    pdfUrl: data.url_danfse
      ? String(data.url_danfse)
      : data.caminho_xml_nota_fiscal
        ? String(data.caminho_xml_nota_fiscal)
        : null,
  };
}
