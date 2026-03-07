import type { Metadata } from "next";
import ValutaBeregner from "@/components/ValutaBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Valutaberegner - Omregn valuta online | MinBeregner.dk",
  description:
    "Gratis valutaberegner. Omregn mellem DKK, EUR, USD, GBP, SEK, NOK og mange flere valutaer. Se aktuelle vejledende kurser.",
  keywords: [
    "valutaberegner",
    "valuta omregner",
    "omregn valuta",
    "dkk til euro",
    "dollar til kroner",
    "valutakurs",
    "veksle penge",
    "currency converter",
    "kroner til euro",
  ],
  openGraph: {
    title: "Valutaberegner - Omregn valuta nemt",
    description: "Omregn mellem danske kroner og andre valutaer. EUR, USD, GBP, SEK, NOK og mange flere.",
    url: `${baseUrl}/valuta`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/valuta`,
  },
};

const faqItems = [
  {
    question: "Hvad er kursen mellem DKK og EUR?",
    answer:
      "Den danske krone er bundet til euroen via ERM2-samarbejdet. Kursen ligger typisk omkring 7,44-7,47 DKK pr. EUR. Danmark fører fastkurspolitik over for euroen.",
  },
  {
    question: "Hvorfor svinger valutakurser?",
    answer:
      "Valutakurser påvirkes af mange faktorer: renteniveauer, inflation, handelsbalancer, politisk stabilitet og markedets forventninger. DKK er dog relativt stabil pga. fastkurspolitikken over for EUR.",
  },
  {
    question: "Hvor kan jeg veksle penge?",
    answer:
      "Du kan veksle penge i banker, vekselkontorer og lufthavne. Online banker og Wise tilbyder ofte bedre kurser. Sammenlign altid kurser og gebyrer inden du veksler.",
  },
  {
    question: "Hvad er forskellen på købs- og salgskurs?",
    answer:
      "Banker og vekselkontorer køber valuta billigere (købskurs) end de sælger (salgskurs). Forskellen kaldes spread og er vekslerens fortjeneste.",
  },
  {
    question: "Er kurserne på denne side aktuelle?",
    answer:
      "Kurserne er vejledende og opdateres ikke i realtid. Ved faktisk veksling bør du altid tjekke den aktuelle kurs hos din bank eller vekselkontor.",
  },
  {
    question: "Hvad er Forex/valutahandel?",
    answer:
      "Forex er det internationale valutamarked, hvor valutaer handles 24/7. Det er verdens største finansielle marked med daglige omsætninger på over 6 billioner dollars.",
  },
];

const relatedCalculators = [
  {
    title: "Momsberegner",
    href: "/moms",
    description: "Beregn dansk moms",
    icon: "🧾",
  },
  {
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter nemt",
    icon: "➗",
  },
  {
    title: "Løn efter skat",
    href: "/loen-efter-skat",
    description: "Se din nettoløn",
    icon: "💰",
  },
];

export default function ValutaPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name="Valutaberegner - Omregn valuta"
        description="Gratis valutaberegner. Omregn mellem DKK, EUR, USD, GBP, SEK, NOK og mange flere valutaer."
        url={`${baseUrl}/valuta`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Valutaberegner", href: "/valuta" }]} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Valutaberegner
        </h1>
        <p className="text-lg text-gray-600">
          Omregn nemt mellem danske kroner og andre valutaer. Se vejledende kurser for EUR, USD, GBP, SEK, NOK og mange flere.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <ValutaBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om valutaomregning</h2>
        <p>
          <strong>Valutakurser</strong> angiver, hvor meget én valuta er værd i forhold til en anden.
          Den <strong>danske krone (DKK)</strong> er bundet til euroen gennem <strong>ERM2-samarbejdet</strong>,
          hvilket betyder at kursen mellem DKK og EUR er relativt <strong>stabil</strong>.
        </p>
        
        <h3>Danmarks fastkurspolitik</h3>
        <p>
          Danmark fører <strong>fastkurspolitik</strong> over for euroen. Det betyder, at <strong>Nationalbanken</strong>
          holder kronens kurs inden for et snævert bånd omkring <strong>centralkursen på 7,46038 DKK pr. EUR</strong>.
          Dette giver <strong>stabilitet</strong> i handlen med eurolandene.
        </p>

        <h3>Populære valutaer</h3>
        <ul>
          <li><strong>EUR (Euro)</strong> - Bruges i 20 EU-lande</li>
          <li><strong>USD (US Dollar)</strong> - Verdens mest handlede valuta</li>
          <li><strong>GBP (Britiske Pund)</strong> - Storbritanniens valuta</li>
          <li><strong>SEK (Svenske Kroner)</strong> - Vores nabolands valuta</li>
          <li><strong>NOK (Norske Kroner)</strong> - Norges valuta</li>
        </ul>

        <h3>Tips ved valutaveksling</h3>
        <ul>
          <li>Sammenlign kurser mellem banker og vekselkontorer</li>
          <li>Undgå at veksle i lufthavne - kurserne er ofte dårligere</li>
          <li>Overvej online tjenester som Wise for bedre kurser</li>
          <li>Brug kreditkort med gode udenlandske transaktionsvilkår</li>
          <li>Veksle aldrig mere end nødvendigt - du taber på begge veje</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators calculators={relatedCalculators} />
      </div>
      <Sidebar currentHref="/valuta" adSlotId="valuta-sidebar" />
    </div>
  );
}
