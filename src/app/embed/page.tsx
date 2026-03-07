import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Embed Beregnere - Gratis Widgets | MinBeregner.dk",
  description:
    "Integrer gratis beregner-widgets på din hjemmeside. Momsberegner, BMI beregner og mere. Kopier koden og indsæt.",
};

const widgets = [
  {
    title: "Momsberegner",
    slug: "moms",
    description: "Tillæg eller fratræk 25% moms",
    width: 500,
    height: 400,
  },
  {
    title: "BMI Beregner",
    slug: "bmi",
    description: "Beregn Body Mass Index",
    width: 500,
    height: 600,
  },
];

export default function EmbedPage() {
  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ name: "Embed Widgets", href: "/embed" }]} />

      <h1 className="text-3xl font-bold mb-2 dark:text-white">
        Gratis Beregner-Widgets
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Integrer vores beregnere på din hjemmeside. Gratis med &quot;Powered by MinBeregner.dk&quot; backlink.
        Kopiér iframe-koden og indsæt den i din HTML.
      </p>

      <div className="space-y-8">
        {widgets.map((w) => (
          <div key={w.slug} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold dark:text-white mb-1">{w.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{w.description}</p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Embed kode:</p>
              <code className="text-sm text-gray-800 dark:text-gray-200 break-all select-all">
                {`<iframe src="https://minberegner.dk/embed/${w.slug}" width="${w.width}" height="${w.height}" frameborder="0" style="border:1px solid #e5e7eb;border-radius:12px;" title="${w.title}"></iframe>`}
              </code>
            </div>

            <a
              href={`/embed/${w.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Se preview →
            </a>
          </div>
        ))}
      </div>

      <div className="mt-12 prose dark:prose-invert max-w-none">
        <h2>Vilkår for brug</h2>
        <ul>
          <li>Widgets er gratis at bruge på din hjemmeside</li>
          <li>&quot;Powered by MinBeregner.dk&quot; linket skal forblive synligt</li>
          <li>Beregnerne opdateres automatisk med nye satser</li>
          <li>Brug af API kræver attribution til MinBeregner.dk</li>
        </ul>
      </div>
    </div>
  );
}
