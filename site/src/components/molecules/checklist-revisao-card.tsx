"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ITENS_CHECKLIST_REVISAO,
  type EstadoChecklistRevisao,
  type ItemChecklistRevisaoId,
} from "@/lib/pesquisa-documental/checklist-revisao";

type Props = {
  estado: EstadoChecklistRevisao;
  onChange: (id: ItemChecklistRevisaoId, marcado: boolean) => void;
  desabilitado?: boolean;
};

export function ChecklistRevisaoCard({ estado, onChange, desabilitado }: Props) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Checklist de revisão humana</CardTitle>
        <p className="text-sm text-muted-foreground">
          Obrigatório antes de salvar e registrar pagamento. Não substitui conferência de fontes.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {ITENS_CHECKLIST_REVISAO.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 text-sm"
          >
            <input
              type="checkbox"
              className="mt-0.5"
              checked={estado[item.id]}
              disabled={desabilitado}
              onChange={(e) => onChange(item.id, e.target.checked)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
