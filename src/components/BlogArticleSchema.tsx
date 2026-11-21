import { ArticleSchema } from "@/components/StructuredData";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { blogArtikel } from "@/lib/blog-artikler";

/**
 * Blogindlæggenes JSON-LD.
 *
 * Alle 27 artikler satte `og:type: "article"` uden at nogen af dem sende en
 * `Article`/`BlogPosting`: ingen `datePublished`, ingen `dateModified`, ingen
 * `headline`, ingen forfatter. Målt på alle 27 URL'er i sitemap'en 2026-09-29.
 *
 * Datoerne læses fra `blog-artikler`, som også skriver bylinjen og kortet på
 * `/blog`, så de tre steder ikke kan glide fra hinanden.
 *
 * Synkron, ikke async: bloggens `page.tsx` er synkrone server-komponenter,
 * og en async child ville suspendere dem. Domænet slås derfor op med
 * `getDomainConfigByLocale("da")` i stedet for `getCurrentDomainConfig()`,
 * som læser `x-hostname` og derfor er async. Det er korrekt, fordi `/blog`
 * står i `danishOnlySections` i `routing.ts` — beraknare.se svarer 404 på
 * hele bloggen — og fordi `routing.test.ts` låser den sektion. Samme mønster
 * som `CalculatorSchema`, der også tager sit domæne fra en `href`.
 */
export default function BlogArticleSchema({
  slug,
  title,
  description,
  category,
}: {
  slug: string;
  title: string;
  description: string;
  category?: string;
}) {
  const domainConfig = getDomainConfigByLocale("da");
  const artikel = blogArtikel(slug);

  return (
    <ArticleSchema
      title={title}
      description={description}
      url={`${domainConfig.baseUrl}/blog/${slug}`}
      datePublished={artikel.publiceret}
      dateModified={artikel.opdateret}
      category={category}
    />
  );
}
