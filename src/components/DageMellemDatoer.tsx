import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import DatoBeregner from "@/components/DatoBeregner";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import { getDageTilHubPath } from "@/lib/dage-til";
import { getKlokkenHubPath } from "@/lib/klokken-i";
import {
  DAGE_MELLEM_PATH,
  dageMellemAfsnit,
  dageMellemCopy,
  dageMellemEksempel,
  getDageMellemPath,
  isDageMellemLocale,
  type DageMellemLocale,
} from "@/lib/dage-mellem-datoer";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Siden for «dage mellem datoer». Der er to route-filer over denne komponent
 * (`/dage-mellem-datoer` og `/dagar-mellan-datum`), og det er *stien* der
 * vælger sproget — samme regel som `/dage-til` og `/klokken-i`. Et kald til den
 * anden sprogs sti er routingens 301, så en `notFound()` her betyder at de to
 * ikke er enige, og det er den der holder en anden kopi af værktøjet ude af
 * indekset.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isDageMellemLocale(locale) || DAGE_MELLEM_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as DageMellemLocale };
}

export async function buildDageMellemMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale } = domainConfig;
  const { locale } = domainConfig;
  if (!isDageMellemLocale(locale) || DAGE_MELLEM_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = dageMellemCopy[locale];
  const canonical = `${baseUrl}${DAGE_MELLEM_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${DAGE_MELLEM_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${DAGE_MELLEM_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${DAGE_MELLEM_PATH.da}`,
  };

  return {
    title: { absolute: c.title },
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function DageMellemDatoerRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = dageMellemCopy[locale];
  const afsnit = dageMellemAfsnit(locale, today);
  const eksempel = dageMellemEksempel(locale, today);
  const sti = DAGE_MELLEM_PATH[locale];
  const dageTilSti = getDageTilHubPath(locale);
  const klokkenSti = getKlokkenHubPath(locale);

  return (
    <div>
      <FAQSchema items={c.faq} />
      <Breadcrumbs
        items={[
          {
            name: locale === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${locale === "da" ? "hverdag" : "praktisk"}`,
          },
          { name: c.h1, href: sti },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{c.lead}</p>

      <div className="mb-8">
        <DatoBeregner />
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        {afsnit.map((afsnit) => (
          <section key={afsnit.overskrift}>
            <h2>{afsnit.overskrift}</h2>
            <p>{afsnit.brødtekst}</p>
          </section>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 not-prose">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {locale === "da" ? "Eksempel" : "Exempel"}
        </p>
        <p className="text-lg text-blue-900 dark:text-blue-100">{eksempel.sætning}</p>
        {eksempel.skudAarTekst && (
          <p className="text-blue-800 dark:text-blue-200 mt-2">
            {eksempel.skudAarTekst}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dato"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          {c.linkDato}
        </Link>
        {locale === "da" && (
          <Link
            href="/ugenummer"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkUgenummer}
          </Link>
        )}
        {dageTilSti && (
          <Link
            href={dageTilSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageTil}
          </Link>
        )}
        {klokkenSti && (
          <Link
            href={klokkenSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {locale === "da" ? "Hvad er klokken i …?" : "Vad är klockan i …?"}
          </Link>
        )}
      </div>

      <FAQ items={c.faq} />
    </div>
  );
}
