import { completarGroq, groqConfigurado } from "@/lib/groq";
import { notificarAdminNovoRelatorio } from "@/lib/email/resend";
import { PROMPT_RELATORIO_SISTEMA } from "@/lib/prompts/relatorio-system";
import { rodapeRelatorio } from "@/lib/relatorio/rodape";
import { getSupabase } from "@/lib/supabase";

const MODELO = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

export async function gerarRelatorioPedido(relatorioId: string): Promise<void> {
  const supabase = getSupabase();

  const { data: rel, error: fetchErr } = await supabase
    .from("relatorios_pedido")
    .select("*")
    .eq("id", relatorioId)
    .single();

  if (fetchErr || !rel) {
    throw new Error(fetchErr?.message ?? "Report not found");
  }

  if (!rel.descricao_caso?.trim()) {
    await supabase
      .from("relatorios_pedido")
      .update({ status: "erro", erro_geracao: "Case description missing" })
      .eq("id", relatorioId);
    return;
  }

  if (!groqConfigurado()) {
    await supabase
      .from("relatorios_pedido")
      .update({
        status: "erro",
        erro_geracao: "GROQ_API_KEY not configured — set in .env.local",
      })
      .eq("id", relatorioId);
    return;
  }

  try {
    const conteudo = await completarGroq(
      [
        { role: "system", content: PROMPT_RELATORIO_SISTEMA },
        {
          role: "user",
          content: [
            `Plan purchased: ${rel.plano ?? "Standard"}`,
            `Client: ${rel.nome_cliente ?? "Not provided"}`,
            "",
            "Case description provided by the client:",
            rel.descricao_caso,
            "",
            "Generate the complete report following the mandatory structure in American English.",
          ].join("\n"),
        },
      ],
      { maxTokens: 3500 }
    );

    const conteudoFinal = `${conteudo.trim()}\n${rodapeRelatorio()}`;

    await supabase
      .from("relatorios_pedido")
      .update({
        conteudo_rascunho: conteudoFinal,
        conteudo_editado: conteudoFinal,
        status: "revisao",
        erro_geracao: null,
        modelo_ia: MODELO,
        updated_at: new Date().toISOString(),
      })
      .eq("id", relatorioId);

    void notificarAdminNovoRelatorio({
      cliente: rel.nome_cliente ?? rel.email_cliente ?? "Client",
      plano: rel.plano ?? "—",
      relatorioId,
    }).catch((e) => console.error("Admin notification:", e));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation error";
    await supabase
      .from("relatorios_pedido")
      .update({ status: "erro", erro_geracao: msg, updated_at: new Date().toISOString() })
      .eq("id", relatorioId);
    throw e;
  }
}
