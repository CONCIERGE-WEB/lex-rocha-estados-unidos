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
        <CardTitle className="text-base">Internal reference — dispute size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Estimated range:{" "}
          <strong className="text-foreground">
            ${est.min.toLocaleString("en-US")} to ${est.max.toLocaleString("en-US")}
          </strong>
        </p>
        {agravantes.length > 0 && (
          <p>Applied multiplier: ×{est.multiplicador.toFixed(2)}</p>
        )}
        <p className="text-xs">
          Based on verified precedents. Do not confuse with report pricing
          ($49 / $79 / $119).
        </p>
      </CardContent>
    </Card>
  );
}
