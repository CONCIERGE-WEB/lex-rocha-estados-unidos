import { COPY } from "@/lib/constants/copy-en";
import {
  PUBLIC_SOURCES,
  PUBLIC_SOURCES_NOTE,
  SOURCE_TYPE_LABEL,
} from "@/lib/constants/public-sources";

export function PublicSourcesSection() {
  const S = COPY.sources;

  return (
    <section id="sources" className="scroll-mt-24 border-b border-ink/8 bg-folio py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-eyebrow">{S.eyebrow}</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-4xl">
          {S.title}
        </h2>
        <p className="mt-5 max-w-3xl text-lead text-muted">{S.description}</p>
        <p className="mt-4 max-w-3xl text-sm text-muted">{PUBLIC_SOURCES_NOTE}</p>

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {PUBLIC_SOURCES.map((source) => (
            <li key={source.url}>
              <article className="feature-card h-full">
                <span className="inline-block rounded-full bg-cite px-3 py-1 text-xs font-semibold uppercase tracking-wide text-trust">
                  {SOURCE_TYPE_LABEL[source.type]}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{source.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{source.description}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust hover:underline"
                >
                  Visit portal →
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
