import Link from "next/link";
import { getLocale } from "@/lib/get-locale";
import { getTranslations } from "@/lib/i18n";

export interface Calculator {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

interface RelatedCalculatorsProps {
  current?: string; // Current page href to exclude (optional)
  calculators?: Calculator[];
}

const allCalculators: Calculator[] = [
  // Økonomi & Løn
  {
    title: "Løn efter skat",
    description: "Beregn din nettoløn efter skat",
    href: "/loen-efter-skat",
    icon: "💰",
  },
  {
    title: "Dagpenge",
    description: "Beregn dine dagpenge",
    href: "/dagpenge",
    icon: "📋",
  },
  {
    title: "Feriepenge",
    description: "Beregn dine feriepenge",
    href: "/feriepenge",
    icon: "🏖️",
  },
  {
    title: "SU Beregner",
    description: "Beregn din SU",
    href: "/su",
    icon: "🎓",
  },
  {
    title: "Pension",
    description: "Beregn din pension",
    href: "/pension",
    icon: "👴",
  },
  {
    title: "Efterløn",
    description: "Beregn din efterløn",
    href: "/efterloen",
    icon: "🏡",
  },
  {
    title: "Barselsdagpenge",
    description: "Beregn barselsdagpenge",
    href: "/barselsdagpenge",
    icon: "👶",
  },
  {
    title: "Børnepenge",
    description: "Se børne- og ungeydelse",
    href: "/boernepenge",
    icon: "👧",
  },
  {
    title: "Timepris",
    description: "Beregn din timepris",
    href: "/timepris",
    icon: "⏰",
  },
  // Lån & Bolig
  {
    title: "Boliglån",
    description: "Beregn dit boliglån",
    href: "/boliglaan",
    icon: "🏠",
  },
  {
    title: "Renteberegner",
    description: "Beregn renter på lån",
    href: "/renteberegner",
    icon: "🏦",
  },
  {
    title: "Husleje",
    description: "Beregn rimelig husleje",
    href: "/husleje",
    icon: "🔑",
  },
  {
    title: "Boligstøtte",
    description: "Beregn din boligstøtte",
    href: "/boligstoette",
    icon: "🏘️",
  },
  {
    title: "Låneberegner",
    description: "Beregn dit lån",
    href: "/laaneberegner",
    icon: "💳",
  },
  {
    title: "Opsparing",
    description: "Renters rente beregner",
    href: "/opsparing",
    icon: "📈",
  },
  {
    title: "Rentefradrag",
    description: "Beregn dit rentefradrag",
    href: "/rentefradrag",
    icon: "📉",
  },
  {
    title: "Billån",
    description: "Beregn dit billån",
    href: "/billaan",
    icon: "🚙",
  },
  {
    title: "Forbrugslån",
    description: "Beregn dit forbrugslån",
    href: "/forbrugslaan",
    icon: "💸",
  },
  {
    title: "Ejendomsværdiskat",
    description: "Beregn din boligskat",
    href: "/ejendomsvaerdiskat",
    icon: "🏡",
  },
  {
    title: "Arveafgift",
    description: "Beregn boafgift",
    href: "/arveafgift",
    icon: "📜",
  },
  // Moms & Procent
  {
    title: "Moms",
    description: "Beregn moms til/fra",
    href: "/moms",
    icon: "🧾",
  },
  {
    title: "Procent",
    description: "Beregn procent nemt",
    href: "/procent",
    icon: "➗",
  },
  // Sundhed
  {
    title: "BMI Beregner",
    description: "Beregn dit Body Mass Index",
    href: "/bmi",
    icon: "⚖️",
  },
  {
    title: "Kalorieberegner",
    description: "Beregn kaloriebehov",
    href: "/kalorier",
    icon: "🍎",
  },
  // Tid
  {
    title: "Datoberegner",
    description: "Dage mellem datoer",
    href: "/dato",
    icon: "📅",
  },
  {
    title: "Tidsberegner",
    description: "Beregn tid og varighed",
    href: "/tidsberegner",
    icon: "⏱️",
  },
  {
    title: "Tidszone",
    description: "Omregn tidszoner",
    href: "/tidszone",
    icon: "🌍",
  },
  {
    title: "Alder",
    description: "Beregn din præcise alder",
    href: "/alder",
    icon: "🎂",
  },
  // Bil & Energi
  {
    title: "Bil",
    description: "Beregn biludgifter",
    href: "/bil",
    icon: "🚗",
  },
  {
    title: "Brændstof",
    description: "Beregn brændstofforbrug",
    href: "/braendstof",
    icon: "⛽",
  },
  {
    title: "Elberegner",
    description: "Beregn dit elforbrug",
    href: "/elberegner",
    icon: "⚡",
  },
  // Andet
  {
    title: "Kvadratmeter",
    description: "Beregn areal",
    href: "/kvadratmeter",
    icon: "📐",
  },
  {
    title: "Valuta",
    description: "Omregn valutaer",
    href: "/valuta",
    icon: "💱",
  },
];

// Map related calculators by topic - each has 5 related
const relatedMap: Record<string, string[]> = {
  // Økonomi & Løn
  "/loen-efter-skat": ["/feriepenge", "/dagpenge", "/pension", "/timepris", "/rentefradrag"],
  "/dagpenge": ["/loen-efter-skat", "/efterloen", "/barselsdagpenge", "/su", "/feriepenge"],
  "/feriepenge": ["/loen-efter-skat", "/dagpenge", "/barselsdagpenge", "/pension", "/timepris"],
  "/su": ["/loen-efter-skat", "/boernepenge", "/boligstoette", "/dagpenge", "/feriepenge"],
  "/pension": ["/loen-efter-skat", "/efterloen", "/opsparing", "/arveafgift", "/feriepenge"],
  "/efterloen": ["/pension", "/dagpenge", "/loen-efter-skat", "/arveafgift", "/opsparing"],
  "/barselsdagpenge": ["/boernepenge", "/dagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/boernepenge": ["/barselsdagpenge", "/su", "/boligstoette", "/loen-efter-skat", "/dagpenge"],
  "/timepris": ["/loen-efter-skat", "/moms", "/procent", "/feriepenge", "/dagpenge"],
  
  // Lån & Bolig
  "/boliglaan": ["/renteberegner", "/laaneberegner", "/husleje", "/ejendomsvaerdiskat", "/rentefradrag"],
  "/renteberegner": ["/boliglaan", "/laaneberegner", "/opsparing", "/procent", "/rentefradrag"],
  "/husleje": ["/boligstoette", "/boliglaan", "/ejendomsvaerdiskat", "/loen-efter-skat", "/kvadratmeter"],
  "/boligstoette": ["/husleje", "/boernepenge", "/loen-efter-skat", "/su", "/dagpenge"],
  "/laaneberegner": ["/boliglaan", "/renteberegner", "/billaan", "/forbrugslaan", "/rentefradrag"],
  "/opsparing": ["/renteberegner", "/pension", "/laaneberegner", "/procent", "/loen-efter-skat"],
  "/rentefradrag": ["/boliglaan", "/renteberegner", "/laaneberegner", "/loen-efter-skat", "/opsparing"],
  "/billaan": ["/bil", "/laaneberegner", "/renteberegner", "/forbrugslaan", "/braendstof"],
  "/forbrugslaan": ["/laaneberegner", "/renteberegner", "/billaan", "/boliglaan", "/rentefradrag"],
  "/ejendomsvaerdiskat": ["/boliglaan", "/boligstoette", "/husleje", "/rentefradrag", "/loen-efter-skat"],
  "/arveafgift": ["/pension", "/efterloen", "/loen-efter-skat", "/opsparing", "/rentefradrag"],

  // Moms & Procent
  "/moms": ["/procent", "/timepris", "/loen-efter-skat", "/valuta", "/renteberegner"],
  "/procent": ["/moms", "/renteberegner", "/opsparing", "/bmi", "/kalorier"],
  
  // Sundhed
  "/bmi": ["/kalorier", "/alder", "/procent", "/dato", "/tidsberegner"],
  "/kalorier": ["/bmi", "/procent", "/alder", "/dato", "/tidsberegner"],
  
  // Tid
  "/dato": ["/tidsberegner", "/alder", "/tidszone", "/feriepenge", "/pension"],
  "/tidsberegner": ["/dato", "/tidszone", "/alder", "/timepris", "/kalorier"],
  "/tidszone": ["/dato", "/tidsberegner", "/valuta", "/alder", "/timepris"],
  "/alder": ["/dato", "/pension", "/bmi", "/tidsberegner", "/efterloen"],
  
  // Bil & Energi
  "/bil": ["/braendstof", "/billaan", "/elberegner", "/forbrugslaan", "/loen-efter-skat"],
  "/braendstof": ["/bil", "/elberegner", "/procent", "/valuta", "/kvadratmeter"],
  "/elberegner": ["/braendstof", "/bil", "/procent", "/husleje", "/boligstoette"],
  
  // Andet
  "/kvadratmeter": ["/husleje", "/boliglaan", "/procent", "/braendstof", "/elberegner"],
  "/valuta": ["/moms", "/procent", "/tidszone", "/loen-efter-skat", "/bil"],
};

export function RelatedCalculators({
  current,
  calculators,
}: RelatedCalculatorsProps) {
  // If calculators are provided directly, use them
  if (calculators && calculators.length > 0) {
    return <RelatedGrid calculators={calculators} />;
  }

  // Use provided calculators or get related ones based on current page
  const relatedHrefs = current ? relatedMap[current] || [] : [];
  const related = allCalculators
    .filter((calc) => relatedHrefs.includes(calc.href))
    .slice(0, 5);

  if (related.length === 0) {
    // Fallback: show 5 random calculators (not current)
    const fallback = allCalculators
      .filter((calc) => calc.href !== current)
      .slice(0, 5);
    return <RelatedGrid calculators={fallback} />;
  }

  return <RelatedGrid calculators={related} />;
}

async function RelatedGrid({ calculators }: { calculators: Calculator[] }) {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <section className="mt-12 pt-8 border-t dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">{t.ui.relatedCalculators}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md dark:hover:bg-gray-700 transition-shadow flex items-center gap-3"
          >
            {calc.icon && <span className="text-2xl">{calc.icon}</span>}
            <div>
              <p className="font-medium dark:text-white">{calc.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{calc.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedCalculators;
