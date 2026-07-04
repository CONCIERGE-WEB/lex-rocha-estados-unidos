import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumoPacotePesquisa } from "@/lib/pesquisa-documental/resumo-pacote";

type Props = {
  pacote: ResumoPacotePesquisa;
};

export function PacotePesquisaCard({ pacote }: Props) {
  const plano =
    pacote.plano.tipo === "sem_cobranca"
      ? `Sem cobrança — ${pacote.plano.label}`
      : `${pacote.plano.label} · R$ ${pacote.plano.valor}`;

  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardHeader>
        <CardTitle className="text-lg text-emerald-950">Pacote de pesquisa validado</CardTitle>
        <p className="text-sm text-emerald-900/80">
          Plano resolvido por regra · {pacote.qtdPrecedentes} precedente(s) ·{" "}
          {pacote.qtdLegislacao} referência(s) legislativa(s)
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-emerald-950">
        <p>
          <span className="font-medium">Plano:</span> {plano}
        </p>
        <p>
          <span className="font-medium">Montado em:</span>{" "}
          {new Date(pacote.montadoEm).toLocaleString("pt-BR")}
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">URLs autorizadas ({pacote.urlsAutorizadas.length})</summary>
          <ul className="mt-2 list-inside list-disc break-all">
            {pacote.urlsAutorizadas.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
