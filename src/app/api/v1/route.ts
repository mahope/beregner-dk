import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "MinBeregner API",
    version: "1.0",
    description: "Gratis API til danske beregnere. Opdateret med 2026-satser.",
    endpoints: {
      "/api/v1/moms": {
        method: "GET",
        description: "Beregn moms (25%)",
        params: {
          beloeb: "Beløb i kr. (påkrævet)",
          type: "tillaeg | fratraek (standard: tillaeg)",
        },
        example: "/api/v1/moms?beloeb=1000&type=tillaeg",
      },
      "/api/v1/bmi": {
        method: "GET",
        description: "Beregn BMI",
        params: {
          vaegt: "Vægt i kg (påkrævet)",
          hoejde: "Højde i cm (påkrævet)",
        },
        example: "/api/v1/bmi?vaegt=80&hoejde=180",
      },
      "/api/v1/loen": {
        method: "GET",
        description: "Beregn løn efter skat (2026-satser)",
        params: {
          brutto: "Bruttoløn i kr. (påkrævet)",
          periode: "aar | maaned (standard: aar)",
          kommuneskat: "Kommuneskatteprocent (standard: 25.07)",
          kirkeskat: "true | false (standard: false)",
          kirkeskat_pct: "Kirkeskatteprocent (standard: 0.68)",
        },
        example: "/api/v1/loen?brutto=500000&kommuneskat=25.07",
      },
    },
    rate_limit: "100 kald/dag (gratis)",
    attribution: "Powered by MinBeregner.dk",
  });
}
