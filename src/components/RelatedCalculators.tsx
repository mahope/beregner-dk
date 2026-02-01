import Link from "next/link";

interface Calculator {
  title: string;
  description: string;
  href: string;
  icon: string;
}

interface RelatedCalculatorsProps {
  current: string; // Current page href to exclude
  calculators?: Calculator[];
}

const allCalculators: Calculator[] = [
  {
    title: "BMI Beregner",
    description: "Beregn dit Body Mass Index",
    href: "/bmi",
    icon: "⚖️",
  },
  {
    title: "Løn efter skat",
    description: "Se din nettoløn efter skat",
    href: "/loen-efter-skat",
    icon: "💰",
  },
  {
    title: "Renteberegner",
    description: "Beregn ydelse på lån",
    href: "/renteberegner",
    icon: "🏦",
  },
  {
    title: "Procentberegner",
    description: "Beregn procent nemt",
    href: "/procent",
    icon: "➗",
  },
  {
    title: "Elberegner",
    description: "Beregn dit elforbrug",
    href: "/elberegner",
    icon: "⚡",
  },
  {
    title: "Feriepenge",
    description: "Beregn dine feriepenge",
    href: "/feriepenge",
    icon: "🏖️",
  },
  {
    title: "Børnepenge",
    description: "Se børne- og ungeydelse",
    href: "/boernepenge",
    icon: "👶",
  },
  {
    title: "SU Beregner",
    description: "Beregn din SU",
    href: "/su",
    icon: "🎓",
  },
];

// Map related calculators by topic
const relatedMap: Record<string, string[]> = {
  "/bmi": ["/loen-efter-skat", "/procent"],
  "/loen-efter-skat": ["/feriepenge", "/renteberegner", "/procent"],
  "/elberegner": ["/loen-efter-skat", "/procent"],
  "/feriepenge": ["/loen-efter-skat", "/procent", "/su"],
  "/boernepenge": ["/su", "/feriepenge", "/loen-efter-skat"],
  "/su": ["/loen-efter-skat", "/boernepenge", "/feriepenge"],
  "/renteberegner": ["/loen-efter-skat", "/procent", "/feriepenge"],
  "/procent": ["/renteberegner", "/loen-efter-skat", "/elberegner"],
};

export default function RelatedCalculators({
  current,
  calculators,
}: RelatedCalculatorsProps) {
  // Use provided calculators or get related ones based on current page
  const relatedHrefs = relatedMap[current] || [];
  const related =
    calculators ||
    allCalculators
      .filter((calc) => relatedHrefs.includes(calc.href))
      .slice(0, 3);

  if (related.length === 0) {
    // Fallback: show 3 random calculators (not current)
    const fallback = allCalculators
      .filter((calc) => calc.href !== current)
      .slice(0, 3);
    return <RelatedGrid calculators={fallback} />;
  }

  return <RelatedGrid calculators={related} />;
}

function RelatedGrid({ calculators }: { calculators: Calculator[] }) {
  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-bold mb-4">Relaterede beregnere</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {calculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <span className="text-2xl">{calc.icon}</span>
            <div>
              <p className="font-medium">{calc.title}</p>
              <p className="text-sm text-gray-500">{calc.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
