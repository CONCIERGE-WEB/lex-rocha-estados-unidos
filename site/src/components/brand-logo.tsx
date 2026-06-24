import { LogoMark } from "@/components/logo-mark";
import { EMPRESA } from "@/lib/constants/empresa";

type Props = {
  compact?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

export function BrandLogo({ compact = false, variant = "light", className = "" }: Props) {
  const titleClass = variant === "dark" ? "text-folio" : "text-ink";
  const subClass = variant === "dark" ? "text-onDarkMuted" : "text-muted";

  if (compact) {
    return <LogoMark variant={variant} className={`h-9 w-9 shrink-0 ${className}`} />;
  }

  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2.5 sm:gap-3 ${className}`}>
      <LogoMark variant={variant} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="min-w-0">
        <span
          className={`block font-display text-base font-semibold leading-tight tracking-tight sm:text-lg ${titleClass}`}
        >
          {EMPRESA.marca}
        </span>
        <span
          className={`hidden truncate font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] sm:block sm:text-[0.65rem] sm:tracking-[0.14em] ${subClass}`}
        >
          {EMPRESA.subtitulo}
        </span>
      </span>
    </span>
  );
}
