export type LinhaIr = {
  data: string;
  valor: number;
  forma: string | null;
  status: string;
  relatorioId: string;
  nfseNumero?: string | null;
};

const CABECALHO = [
  "Data",
  "Valor (BRL)",
  "Forma de pagamento",
  "Status",
  "Relatorio ID",
  "NFS-e numero",
];

function escapeCampo(valor: string): string {
  const precisaAspas = /[";\n\r]/.test(valor);
  const escapado = valor.replace(/"/g, '""');
  return precisaAspas ? `"${escapado}"` : escapado;
}

function valorBR(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(2).replace(".", ",");
}

function dataBR(iso: string): string {
  const parte = (iso ?? "").slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(parte);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function gerarCsvIr(linhas: LinhaIr[]): string {
  const out = [CABECALHO.join(";")];
  for (const l of linhas) {
    out.push(
      [
        escapeCampo(dataBR(l.data)),
        escapeCampo(valorBR(Number(l.valor ?? 0))),
        escapeCampo(l.forma ?? ""),
        escapeCampo(l.status ?? ""),
        escapeCampo(l.relatorioId ?? ""),
        escapeCampo(l.nfseNumero ?? ""),
      ].join(";")
    );
  }
  return "\uFEFF" + out.join("\r\n") + "\r\n";
}

export function totalRecebido(linhas: LinhaIr[]): number {
  return linhas
    .filter((l) => l.status === "pago")
    .reduce((s, l) => s + Number(l.valor ?? 0), 0);
}
