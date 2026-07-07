import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import {
  categories,
  getCategoryBySlug,
  getBeregnereByCategoryName,
  getAllCategorySlugs,
} from "@/lib/categories";
import { getCurrentDomainConfig } from "@/lib/get-locale";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const domainConfig = await getCurrentDomainConfig();
  const baseUrl = domainConfig.baseUrl;

  return {
    title: `${category.title} | ${domainConfig.siteName}`,
    description: category.metaDescription,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.metaDescription,
      url: `${baseUrl}/kategori/${slug}`,
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/kategori/${slug}`,
    },
  };
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const domainConfig = await getCurrentDomainConfig();
  const baseUrl = domainConfig.baseUrl;

  if (!category) {
    notFound();
  }

  const categoryBeregnere = getBeregnereByCategoryName(category.name, domainConfig.locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.metaDescription,
    url: `${baseUrl}/kategori/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryBeregnere.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.title,
        url: `${baseUrl}${b.href}`,
      })),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQSchema items={category.faqItems} />
      <Breadcrumbs
        items={[{ name: category.name, href: `/kategori/${slug}` }]}
      />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="mr-2">{category.emoji}</span>
          {category.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          {category.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 animate-stagger">
        {categoryBeregnere.map((beregner) => (
          <Link
            key={beregner.href}
            href={beregner.href}
            className="group block p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all hover-lift"
          >
            <div className="text-3xl mb-3">{beregner.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {beregner.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {beregner.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Other categories */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Andre kategorier
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                <span>{c.emoji}</span>
                {c.name}
              </Link>
            ))}
        </div>
      </div>

      <FAQ items={category.faqItems} />
    </div>
  );
}
