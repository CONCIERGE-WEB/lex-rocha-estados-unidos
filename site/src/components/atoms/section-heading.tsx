import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
