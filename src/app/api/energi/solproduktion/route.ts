import { prisomraadeForPostnummer } from "@/lib/energi/elpriser";
import { slaaPostnummerOp } from "@/lib/energi/postnumre";
import { getPvgis } from "@/lib/energi/server";
import { HAELDNINGER, PVGIS_ASPEKT, type PvgisRetning } from "@/lib/energi/solceller";

export const dynamic = "force-dynamic";

/**
 * Yearly solar production for 1 kWp at a Danish postcode, from PVGIS.
 * Internal endpoint for /solceller — not part of the public /api/v1 contract.
 *
 * GET /api/energi/solproduktion?postnr=8000&retning=syd&haeldning=35
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const postnr = (params.get("postnr") ?? "").trim();
  const retning = (params.get("retning") ?? "syd") as PvgisRetning;
  const haeldning = Number(params.get("haeldning") ?? "35");

  const sted = slaaPostnummerOp(postnr);
  if (!sted) return Response.json({ error: "Ukendt postnummer" }, { status: 404 });
  if (!(retning in PVGIS_ASPEKT)) return Response.json({ error: "Ugyldig retning" }, { status: 400 });
  if (!(HAELDNINGER as readonly number[]).includes(haeldning)) {
    return Response.json({ error: "Ugyldig hældning" }, { status: 400 });
  }

  const pvgis = await getPvgis({ lat: sted.lat, lon: sted.lon, angle: haeldning, aspect: PVGIS_ASPEKT[retning] });
  if (!pvgis) return Response.json({ error: "PVGIS er ikke tilgængelig lige nu" }, { status: 503 });

  return Response.json(
    {
      postnr: sted.postnr,
      navn: sted.navn,
      prisomraade: prisomraadeForPostnummer(sted.postnr),
      kwhPrKwp: pvgis.kwhPrKwp,
      maaneder: pvgis.maaneder,
      hentet: pvgis.hentet,
    },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
