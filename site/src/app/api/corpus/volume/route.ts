import { NextResponse } from "next/server";

import {
  CATEGORIAS_VOLUME_DESTAQUE,
  contarVolumeCorpusCategoria,
  textoSeloVolume,
} from "@/lib/fontes-us/corpus-volume";
import { normalizarCategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Contadores reais do corpus (cluster_id únicos) para selos no frontend. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("category")?.trim();

  if (raw) {
    const cat = normalizarCategoriaPipeline(raw);
    if (!cat) {
      return NextResponse.json({ error: "Unknown category." }, { status: 400 });
    }
    const stats = contarVolumeCorpusCategoria(cat);
    if (!stats) {
      return NextResponse.json({ error: "No stats." }, { status: 404 });
    }
    return NextResponse.json({
      ...stats,
      badge: textoSeloVolume(stats),
    });
  }

  const items = CATEGORIAS_VOLUME_DESTAQUE.map((category) => {
    const stats = contarVolumeCorpusCategoria(category)!;
    return { ...stats, badge: textoSeloVolume(stats) };
  });

  return NextResponse.json({ items });
}
