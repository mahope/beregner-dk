import Link from "next/link";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getTranslations } from "@/lib/i18n";
import { getRouteDecision } from "@/lib/routing";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Renders both visible breadcrumb navigation and JSON-LD BreadcrumbSchema.
 * Items should NOT include "Forside" — it is prepended automatically.
 *
 * Usage:
 *   <Breadcrumbs items={[{ name: "Sundhed", href: "/kategori/sundhed" }, { name: "BMI Beregner", href: "/bmi" }]} />
 *   → Forside / Sundhed / BMI Beregner
 *
 * A crumb is only rendered as a link when its href actually resolves on the
 * current domain. Sections that exist on one domain only (e.g. /kategori and
 * /blog are Danish) would otherwise hand Swedish and Norwegian visitors a 404,
 * both in the visible trail and in the BreadcrumbList JSON-LD.
 */
export default async function Breadcrumbs({ items }: BreadcrumbsProps) {
  const domainConfig = await getCurrentDomainConfig();
  const t = getTranslations(domainConfig.locale);
  const baseUrl = domainConfig.baseUrl;
  const homeName = t.nav.home;

  const allItems = [{ name: homeName, href: "/" }, ...items];
  const lastIndex = allItems.length - 1;
  const isLinkable = (item: BreadcrumbItem, index: number) =>
    index < lastIndex && getRouteDecision(domainConfig, item.href).type === "allow";

  const schemaItems = allItems.map((item, index) => ({
    name: item.name,
    url: isLinkable(item, index)
      ? `${baseUrl}${item.href}`.replace(/\/$/, "")
      : undefined,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <ol className="flex flex-wrap items-center gap-1">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">/</span>
              )}
              {isLinkable(item, index) ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={
                    index === lastIndex
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
