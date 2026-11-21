import { generatePageMetadata } from "@/lib/page-helpers";
import { getPageData } from "@/lib/page-data";
import HjerterytmeBeregner from "@/components/HjerterytmeBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("hjerterytme");
}

export default function HjerterytmePage() {
  const pageData = getPageData("hjerterytme", "da");
  if (!pageData) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Sundhed", href: "/kategori/sundhed" },
          { name: pageData.title, href: "/hjerterytme" },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pageData.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{pageData.description}</p>
          <div className="mt-6">
            <HjerterytmeBeregner />
          </div>
          <div className="mt-8">
            <FAQ items={pageData.faqItems} />
          </div>
          <CalculatorSchema name={pageData.schemaName} description={pageData.schemaDescription} url="https://minberegner.dk/hjerterytme" />
          <FAQSchema items={pageData.faqItems} />
        </main>
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
      </div>
      <RelatedCalculators current="hjerterytme" />
    </div>
  );
}
