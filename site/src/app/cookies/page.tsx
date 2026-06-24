import { LegalPage } from "@/components/legal-page";
import { EMPRESA } from "@/lib/constants/empresa";
import { COOKIES } from "@/lib/constants/legal-privacy";

export const metadata = {
  title: `Cookie Policy — ${EMPRESA.marca}`,
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        In accordance with applicable U.S. privacy laws and industry best practices, we inform you
        about the use of cookies on this site.
      </p>

      <h2>Essential cookies</h2>
      <p>{COOKIES.essenciais}</p>

      <h2>Analytics cookies</h2>
      <p>{COOKIES.analiticos}</p>

      <h2>Cookie inventory</h2>
      <div className="overflow-x-auto">
        <table className="mt-4 min-w-full border border-ink/10 text-sm">
          <thead className="bg-cite/30">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Purpose</th>
              <th className="px-3 py-2 text-left font-semibold">Duration</th>
              <th className="px-3 py-2 text-left font-semibold">Third parties</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.inventario.map((c) => (
              <tr key={c.nome} className="border-t border-ink/10">
                <td className="px-3 py-2 font-mono">{c.nome}</td>
                <td className="px-3 py-2">{c.tipo}</td>
                <td className="px-3 py-2">{c.finalidade}</td>
                <td className="px-3 py-2">{c.duracao}</td>
                <td className="px-3 py-2">{c.terceiros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Consent management</h2>
      <p>
        On your first visit, you can choose &quot;Essential only&quot; or &quot;Accept all&quot;. Your
        choice is stored in your browser (localStorage). To review your choice, clear site data in
        your browser settings — the notice will reappear on your next visit.
      </p>

      <h2>Contact</h2>
      <p>
        Cookie questions:{" "}
        <a
          href={`mailto:${EMPRESA.emailPrivacidade}`}
          className="text-trust underline underline-offset-4"
        >
          {EMPRESA.emailPrivacidade}
        </a>
      </p>
    </LegalPage>
  );
}
