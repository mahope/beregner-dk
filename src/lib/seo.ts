export type CalculatorSeo = {
  title: string;
  description: string;
  slug: string;
};

export function calculatorJsonLd(meta: CalculatorSeo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title,
    description: meta.description,
    applicationCategory: 'BusinessApplication',
    url: `https://beregner.dk/${meta.slug}`,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'DKK' },
  };
}
