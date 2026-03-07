import { NextRequest, NextResponse } from "next/server";

const MOMS_SATS = 0.25;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const beloeb = Number(searchParams.get("beloeb"));
  const type = searchParams.get("type") || "tillaeg"; // tillaeg | fratraek

  if (!beloeb || isNaN(beloeb) || beloeb < 0) {
    return NextResponse.json(
      { error: "Ugyldigt beløb. Angiv ?beloeb=1000&type=tillaeg" },
      { status: 400 }
    );
  }

  if (type === "tillaeg") {
    const moms = beloeb * MOMS_SATS;
    return NextResponse.json({
      beloeb_uden_moms: beloeb,
      moms: Math.round(moms * 100) / 100,
      beloeb_inkl_moms: Math.round((beloeb + moms) * 100) / 100,
      momssats: "25%",
    });
  }

  if (type === "fratraek") {
    const uden = beloeb / (1 + MOMS_SATS);
    const moms = beloeb - uden;
    return NextResponse.json({
      beloeb_inkl_moms: beloeb,
      moms: Math.round(moms * 100) / 100,
      beloeb_uden_moms: Math.round(uden * 100) / 100,
      momssats: "25%",
    });
  }

  return NextResponse.json(
    { error: "Ugyldig type. Brug type=tillaeg eller type=fratraek" },
    { status: 400 }
  );
}
