import Link from "next/link";

const beregnere = [
  {
    title: "Boliglånsberegner",
    description: "Beregn månedlig ydelse og se hvad dit boliglån koster",
    href: "/boliglaan",
    icon: "🏠",
    ready: true,
    featured: true,
  },
  {
    title: "Elberegner",
    description: "Beregn dit elforbrug og se hvad dine apparater koster i strøm",
    href: "/elberegner",
    icon: "⚡",
    ready: true,
  },
  {
    title: "BMI Beregner",
    description: "Beregn dit Body Mass Index og se om din vægt er sund",
    href: "/bmi",
    icon: "⚖️",
    ready: true,
  },
  {
    title: "Løn efter skat",
    description: "Se hvad du får udbetalt efter skat og AM-bidrag",
    href: "/loen-efter-skat",
    icon: "💰",
    ready: true,
  },
  {
    title: "Feriepenge",
    description: "Beregn hvor meget du har til gode i feriepenge",
    href: "/feriepenge",
    icon: "🏖️",
    ready: true,
  },
  {
    title: "Børnepenge",
    description: "Se hvad du kan få i børne- og ungeydelse",
    href: "/boernepenge",
    icon: "👶",
    ready: true,
  },
  {
    title: "SU Beregner",
    description: "Beregn din SU baseret på din situation",
    href: "/su",
    icon: "🎓",
    ready: true,
  },
  {
    title: "Pensionsberegner",
    description: "Beregn din fremtidige pension og månedlige udbetaling",
    href: "/pension",
    icon: "🧓",
    ready: true,
  },
  {
    title: "Bilomkostningsberegner",
    description: "Se hvad din bil reelt koster pr. måned og pr. kilometer",
    href: "/bil",
    icon: "🚗",
    ready: true,
  },
  {
    title: "Levetidsberegner",
    description: "Beregn din forventede levetid baseret på statistik",
    href: "https://levetidsberegner.dk",
    icon: "⏳",
    ready: true,
    external: true,
  },
];

export default function Home() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Gratis Online Beregnere</h1>
        <p className="text-xl text-gray-600">
          Danmarks samling af nyttige beregnere til hverdagen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beregnere.map((beregner) => (
          <Link
            key={beregner.href}
            href={beregner.ready ? beregner.href : "#"}
            className={`block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
              !beregner.ready ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-4xl mb-4">{beregner.icon}</div>
            <h2 className="text-xl font-semibold mb-2">
              {beregner.title}
              {!beregner.ready && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  Kommer snart
                </span>
              )}
            </h2>
            <p className="text-gray-600">{beregner.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 prose max-w-none">
        <h2>Om Beregner.dk</h2>
        <p>
          Beregner.dk er din go-to ressource for gratis online beregnere. Vi har
          samlet de mest nyttige værktøjer til at hjælpe dig med at få overblik
          over din økonomi, sundhed og meget mere.
        </p>
        <p>
          Alle vores beregnere er gratis at bruge og kræver ingen tilmelding.
          Dine data gemmes ikke – beregningerne sker lokalt i din browser.
        </p>
      </div>
    </div>
  );
}
