import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResultadoTriagem } from "@/lib/constants/pesquisa-documental";

type Props = {
  triagem: ResultadoTriagem;
};

function SemafaroBadge({ grau }: { grau: ResultadoTriagem["classificacao_interna"]["grau_urgencia"] }) {
  if (grau === "VERMELHO") {
    return (
      <Badge className="border-red-300 bg-red-100 text-red-900 hover:bg-red-100">
        ● Vermelho — alta prioridade
      </Badge>
    );
  }
  if (grau === "AMARELO") {
    return (
      <Badge className="border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100">
        ● Amarelo — atenção
      </Badge>
    );
  }
  return (
    <Badge className="border-green-300 bg-green-100 text-green-900 hover:bg-green-100">
      ● Verde — fluxo normal
    </Badge>
  );
}

export function TriagemResultadoCard({ triagem }: Props) {
  const urgencia = triagem.classificacao_interna.grau_urgencia;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <CardTitle className="text-lg text-primary">Resultado da classificação</CardTitle>
        <SemafaroBadge grau={urgencia} />
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <span className="font-medium text-foreground">Área / Subárea</span>
          <p className="text-muted-foreground">
            {triagem.classificacao_interna.area} · {triagem.classificacao_interna.subarea}
          </p>
        </div>
        <div>
          <span className="font-medium text-foreground">Complexidade</span>
          <p className="capitalize text-muted-foreground">
            {triagem.analise_fatores.complexidade}
          </p>
        </div>
        <div>
          <span className="font-medium text-foreground">Faixa estimada da causa</span>
          <p className="text-muted-foreground">
            {triagem.analise_fatores.faixa_estimada_causa}
          </p>
        </div>
        <div>
          <span className="font-medium text-foreground">Via (referência interna)</span>
          <p className="text-muted-foreground">
            {triagem.analise_fatores.via_sugerida_referencia_interna}
          </p>
        </div>
        <div className="sm:col-span-2">
          <span className="font-medium text-foreground">Risco prescricional evidente</span>
          <p className="text-muted-foreground">
            {triagem.analise_fatores.risco_prescricao_evidente ? "Sim" : "Não"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <span className="font-medium text-foreground">Resumo estruturado</span>
          <p className="text-muted-foreground">{triagem.resumo_estruturado_fatos}</p>
        </div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Triagem para organização interna. Não representa orientação jurídica ao cliente.
        </p>
      </CardContent>
    </Card>
  );
}
