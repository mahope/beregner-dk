import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InlineAd } from "@/components/ads/AdBanner";
import Sidebar from "@/components/Sidebar";

interface CalculatorPageLayoutProps {
  slug: string;
  children: React.ReactNode;
  /** Optional: locale-specific prose content below the calculator */
  content?: React.ReactNode;
  /** Optional: Danish-only prose content (shown only for DA locale) */
  daContent?: React.ReactNode;
}

/**
 * Shared layout for calculator pages.
 * Handles locale-aware metadata display, FAQ, breadcrumbs, sidebar, and ads.
 *
 * Usage:
 * ```tsx
 * export default function BMIPage() {
 *   return (
 *     <CalculatorPageLayout slug="bmi" daContent={<DanishBMIContent />}>
 *       <BMIBeregner />
 *     </CalculatorPageLayout>
 *   );
 * }
 * ```
 */
export default async function CalculatorPageLayout({
  slug,
  children,
  content,
  daContent,
}: CalculatorPageLayoutProps) {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const data = getPageData(slug, locale) || getPageData(slug, "da");

  if (!data) {
    return <div>Page not found</div>;
  }

  const baseUrl = domainConfig.baseUrl;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={data.schemaName}
          description={data.schemaDescription}
          url={`${baseUrl}/${slug}`}
          category={data.schemaCategory}
        />
        <FAQSchema items={data.faqItems} />
        <Breadcrumbs
          items={[
            { name: data.breadcrumbCategory, href: data.breadcrumbCategoryHref },
            { name: data.title, href: `/${slug}` },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{data.description}</p>

        {children}

        <InlineAd slotId={`${slug}-after-calculator`} />

        {/* Show locale-specific content, or DA-only content for Danish */}
        {content}
        {!content && locale === "da" && daContent}

        <InlineAd slotId={`${slug}-before-faq`} />

        <FAQ items={data.faqItems} />

        <RelatedCalculators current={`/${slug}`} />
      </div>

      <Sidebar currentHref={`/${slug}`} adSlotId={`${slug}-sidebar`} />
    </div>
  );
}
