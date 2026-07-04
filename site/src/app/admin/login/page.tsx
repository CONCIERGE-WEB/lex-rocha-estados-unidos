import { SITE } from "@/lib/constants/site";

export const dynamic = "force-dynamic";

const MENSAGENS_ERRO: Record<string, string> = {
  config: "Login administrativo ainda não configurado (variáveis OAuth ausentes).",
  google: "O Google cancelou ou negou a autorização.",
  codigo: "Resposta de autorização inválida.",
  state: "Falha de validação de segurança (state). Tente novamente.",
  token: "Não foi possível obter o token do Google.",
  nao_autorizado: "Esta conta Google não tem permissão de administrador.",
  falha: "Falha inesperada na autenticação. Tente novamente.",
};

export default function AdminLogin({
  searchParams,
}: {
  searchParams?: { erro?: string };
}) {
  const erro = searchParams?.erro ? MENSAGENS_ERRO[searchParams.erro] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{SITE.name}</h1>
          <p className="mt-1 text-sm text-slate-400">Área restrita</p>
        </div>

        <a
          href="/api/admin/auth/google"
          className="block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Entrar com Google
        </a>

        {erro ? (
          <p className="text-sm font-medium text-red-700">{erro}</p>
        ) : null}

        <p className="text-xs text-slate-400">
          Acesso exclusivo para administradores autorizados.
        </p>
      </div>
    </div>
  );
}
