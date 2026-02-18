import Link from "next/link";
import { BreadcrumbSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

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
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = [
    { name: "Forside", url: baseUrl },
    ...items.map((item) => ({ name: item.name, url: `${baseUrl}${item.href}` })),
  ];

  const allItems = [{ name: "Forside", href: "/" }, ...items];
  const lastIndex = allItems.length - 1;

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
              {index < lastIndex ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
