// JSON-LD Structured Data Components for SEO

import { getDomainConfig } from "@/lib/domain-config";

interface FAQItem {
  question: string;
  answer: string;
}

interface CalculatorSchemaProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  siteName?: string;
  currency?: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

interface WebSiteSchemaProps {
  name: string;
  url: string;
  description: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function CalculatorSchema({
  name,
  description,
  url,
  category = "Calculator",
  siteName,
  currency,
}: CalculatorSchemaProps) {
  const pageUrl = new URL(url);
  const domainConfig = getDomainConfig(pageUrl.hostname);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    inLanguage: domainConfig.hreflangCode,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: currency || domainConfig.currency,
    },
    provider: {
      "@type": "Organization",
      name: siteName || domainConfig.siteName,
      url: domainConfig.baseUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema({ name, url, description }: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    publisher: {
      "@type": "Organization",
      name,
      logo: {
        "@type": "ImageObject",
        url: `${url}/icon.svg`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema({
  name = "MinBeregner.dk",
  url = "https://minberegner.dk",
  description = "Gratis online beregnere til økonomi, sundhed og hverdag.",
}: {
  name?: string;
  url?: string;
  description?: string;
} = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: `${url}/icon.svg`,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
