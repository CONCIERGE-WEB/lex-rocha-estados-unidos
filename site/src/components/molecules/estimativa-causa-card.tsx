import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calcularEstimativaCausa,
  type AgravanteId,
} from "@/lib/pesquisa-documental/estimativa";
import type { AreaProblema } from "@/lib/constants/pesquisa-documental";

type Props = {
  area: AreaProblema;
  agravantes: AgravanteId[];
};

export function EstimativaCausaCard({ area, agravantes }: Props) {
  const est = calcularEstimativaCausa(area, agravantes);

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Referência interna — porte da causa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Faixa estimada:{" "}
          <strong className="text-foreground">
            R$ {est.min.toLocaleString("pt-BR")} a R$ {est.max.toLocaleString("pt-BR")}
          </strong>
        </p>
        {agravantes.length > 0 && (
          <p>Multiplicador aplicado: ×{est.multiplicador.toFixed(2)}</p>
        )}
        <p className="text-xs">
          Baseada em precedentes verificados. Não confundir com o preço do relatório
          (R$ 49 / R$ 79 / R$ 119).
        </p>
      </CardContent>
    </Card>
  );
}
