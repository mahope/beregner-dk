import { NextRequest, NextResponse } from "next/server";

function bmiKategori(bmi: number): string {
  if (bmi < 18.5) return "Undervægtig";
  if (bmi < 25) return "Normalvægtig";
  if (bmi < 30) return "Overvægtig";
  if (bmi < 35) return "Fedme klasse I";
  if (bmi < 40) return "Fedme klasse II";
  return "Fedme klasse III";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const vaegt = Number(searchParams.get("vaegt"));
  const hoejde = Number(searchParams.get("hoejde"));

  if (!vaegt || !hoejde || vaegt <= 0 || hoejde <= 0) {
    return NextResponse.json(
      { error: "Angiv ?vaegt=80&hoejde=180 (kg og cm)" },
      { status: 400 }
    );
  }

  const hoejdeM = hoejde / 100;
  const bmi = vaegt / (hoejdeM * hoejdeM);
  const bmiRundet = Math.round(bmi * 10) / 10;
  const idealMin = Math.round(18.5 * hoejdeM * hoejdeM * 10) / 10;
  const idealMax = Math.round(24.9 * hoejdeM * hoejdeM * 10) / 10;

  return NextResponse.json({
    bmi: bmiRundet,
    kategori: bmiKategori(bmi),
    ideal_vaegt: { min_kg: idealMin, max_kg: idealMax },
    input: { vaegt_kg: vaegt, hoejde_cm: hoejde },
  });
}
