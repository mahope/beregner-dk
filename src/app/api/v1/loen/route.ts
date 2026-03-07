import { NextRequest, NextResponse } from "next/server";

const SATSER = {
  amBidrag: 0.08,
  bundskat: 0.1201,
  kommuneskatSnit: 25.07,
  personfradrag: 54100,
  beskaeftigelsesfradragPct: 0.1275,
  beskaeftigelsesfradragMax: 63300,
  mellemskatGraense: 641200,
  mellemskatPct: 0.075,
  topskatGraense: 777900,
  topskatPct: 0.075,
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brutto = Number(searchParams.get("brutto"));
  const kommuneskat = Number(searchParams.get("kommuneskat")) || SATSER.kommuneskatSnit;
  const kirkeskat = searchParams.get("kirkeskat") === "true";
  const kirkeskatPct = Number(searchParams.get("kirkeskat_pct")) || 0.68;
  const periode = searchParams.get("periode") || "aar"; // aar | maaned

  if (!brutto || brutto <= 0) {
    return NextResponse.json(
      { error: "Angiv ?brutto=500000 (årlig bruttoløn). Valgfrit: &kommuneskat=25.07&kirkeskat=true&periode=maaned" },
      { status: 400 }
    );
  }

  const aarlig = periode === "maaned" ? brutto * 12 : brutto;
  const amBidrag = aarlig * SATSER.amBidrag;
  const efterAM = aarlig - amBidrag;
  const beskaeftigelsesfradrag = Math.min(efterAM * SATSER.beskaeftigelsesfradragPct, SATSER.beskaeftigelsesfradragMax);
  const skattepligtig = Math.max(0, efterAM - SATSER.personfradrag - beskaeftigelsesfradrag);

  const bundSkat = skattepligtig * SATSER.bundskat;
  const kommuneSkat = skattepligtig * (kommuneskat / 100);
  const kirkeSkatBeloeb = kirkeskat ? skattepligtig * (kirkeskatPct / 100) : 0;
  const mellemSkat = Math.max(0, efterAM - SATSER.mellemskatGraense) * SATSER.mellemskatPct;
  const topSkat = Math.max(0, efterAM - SATSER.topskatGraense) * SATSER.topskatPct;

  const totalSkat = bundSkat + kommuneSkat + kirkeSkatBeloeb + mellemSkat + topSkat;
  const nettoAarlig = efterAM - totalSkat;

  return NextResponse.json({
    input: {
      brutto_aarlig: aarlig,
      kommuneskat_pct: kommuneskat,
      kirkeskat,
    },
    am_bidrag: Math.round(amBidrag),
    loen_efter_am: Math.round(efterAM),
    beskaeftigelsesfradrag: Math.round(beskaeftigelsesfradrag),
    skattepligtig_indkomst: Math.round(skattepligtig),
    skat: {
      bundskat: Math.round(bundSkat),
      kommuneskat: Math.round(kommuneSkat),
      kirkeskat: Math.round(kirkeSkatBeloeb),
      mellemskat: Math.round(mellemSkat),
      topskat: Math.round(topSkat),
      total: Math.round(totalSkat),
    },
    netto_aarlig: Math.round(nettoAarlig),
    netto_maanedlig: Math.round(nettoAarlig / 12),
    effektiv_skatteprocent: Math.round(((amBidrag + totalSkat) / aarlig) * 1000) / 10,
    satser_aar: 2026,
  });
}
