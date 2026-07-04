import Link from "next/link";
import { Briefcase, CheckCircle2 } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { SITE } from "@/lib/constants/site";

const { parceiro } = COPY_SITE;

export const metadata = {
  title: "Lista de espera — Escritórios parceiros",
  description: parceiro.intro,
};

const beneficiosParceiro = [
  "Leads com pesquisa documental e resumo do caso já estruturados",
  "Menos tempo de triagem inicial no escritório",
  "Programa comercial em estruturação — vagas limitadas por região",
] as const;

export default function ParceiroPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-4 md:px-6">
        <Logo showTagline />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
        <Badge variant="accent" className="mb-4">
          {parceiro.badge}
        </Badge>
        <h1 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          {parceiro.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{parceiro.intro}</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Briefcase className="size-5 text-primary" />
              Benefícios previstos
            </CardTitle>
            <CardDescription>
              Modelo comercial em definição. Entre em contato para manifestar interesse.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {beneficiosParceiro.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 rounded-lg border bg-secondary/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Cadastro automatizado de parceiros será habilitado em fase posterior. Por
            enquanto, utilize o e-mail institucional:
          </p>
          <Button asChild className="mt-4" size="lg">
            <a href={`mailto:${SITE.email}?subject=Lista%20de%20espera%20parceiro%20Lex%20Rocha`}>
              Solicitar vaga na lista de espera
            </a>
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            ← Voltar ao início
          </Link>
        </p>
      </main>
    </div>
  );
}
