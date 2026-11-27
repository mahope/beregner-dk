import { NextResponse, type NextRequest } from "next/server";
import { getDomainConfigForHost } from "@/lib/domain-config";
import {
  CVRRADAR_BEREGNER_URL,
  type CvrApiSvar,
  byggeCvrradarForespoergsel,
  erGyldigtCvr,
  ipPrefiks,
  isMomsCvrEnabled,
  klientIpFraHeaders,
  parseCvrradarSvar,
} from "@/lib/moms-cvr";
import { postTilCvrradar } from "@/lib/cvrradar-klient";
import { lavRateLimit } from "@/lib/rate-limit";

/**
 * Company VAT facts for the optional CVR field on /moms (minberegner.dk only).
 *
 * POST /api/cvr with JSON { cvr: "12345678", samtykke: boolean, mail?: string }
 *
 * - Off (404) unless NEXT_PUBLIC_MOMS_CVR is on, and only on Danish hosts.
 * - The key (CVRRADAR_BEREGNER_NOEGLE) is only read here and never sent to the browser.
 * - The IP comes from CF-Connecting-IP (set by Cloudflare), never from X-Forwarded-For,
 *   which a visitor can forge. The visitor's IP is cut to /24 (IPv4) or /48 (IPv6) at once; the full address is not
 *   kept, logged or forwarded. Prefix and mail domain are only forwarded with consent.
 * - Missing key or a failing cvrradar gives 200 { tilgaengelig: false }, so the
 *   calculator just works without the extra facts.
 * - cvrradar is called with node:http(s), not fetch: fetch adds Sec-Fetch-Mode, and cvrradar
 *   refuses anything that looks like a browser.
 * Contract: docs/moms-cvr.md.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIMEOUT_MS = 5000;
const GRAENSE_PR_MINUT = 20;
// Keyed by network prefix, never by the full IP.
const rateLimit = lavRateLimit(GRAENSE_PR_MINUT);

const json = (body: CvrApiSvar | { fejl: string }, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!isMomsCvrEnabled() || getDomainConfigForHost(req.headers.get("host") || "")?.locale !== "da") {
    return json({ fejl: "Ikke tilgængelig" }, 404);
  }
  // Only our own pages may use the route (browsers send Sec-Fetch-Site).
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return json({ fejl: "Ikke tilladt" }, 403);

  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // Invalid JSON is treated as a missing CVR below.
  }
  const cvr = body.cvr;
  if (!erGyldigtCvr(cvr)) return json({ fejl: "Ugyldigt CVR-nummer" }, 400);
  const samtykke = body.samtykke === true;

  // Reduce the IP straight away; only the prefix lives on from here.
  const prefiks = ipPrefiks(klientIpFraHeaders(req.headers));
  if (!rateLimit.tilladt(prefiks ?? "ukendt")) {
    return json({ fejl: "For mange opslag. Prøv igen om et minut." }, 429);
  }

  const noegle = process.env.CVRRADAR_BEREGNER_NOEGLE;
  if (!noegle) return json({ tilgaengelig: false });

  const forespoergsel = byggeCvrradarForespoergsel({ cvr, samtykke, ipPrefiks: prefiks, mail: body.mail });

  try {
    const res = await postTilCvrradar(
      process.env.CVRRADAR_BEREGNER_URL || CVRRADAR_BEREGNER_URL,
      noegle,
      forespoergsel,
      TIMEOUT_MS,
    );
    if (res.status === 404) return json({ tilgaengelig: true, fundet: false });
    if (res.status < 200 || res.status >= 300) {
      console.warn(`[cvr] cvrradar svarede ${res.status}`);
      return json({ tilgaengelig: false });
    }
    const svar = parseCvrradarSvar(res.json);
    if (!svar) {
      console.warn("[cvr] uventet svar fra cvrradar");
      return json({ tilgaengelig: false });
    }
    // Not a company (ENK, PMV, I/S ...): cvrradar sends nothing about it, and neither do we.
    if (!svar.selskab) return json({ tilgaengelig: true, fundet: true, selskab: false, cvr });
    // Without consent we never tell the visitor anything was stored, whatever cvrradar says.
    return json({ tilgaengelig: true, fundet: true, cvr, ...svar, gemt: samtykke && svar.gemt });
  } catch {
    console.warn("[cvr] cvrradar svarede ikke");
    return json({ tilgaengelig: false });
  }
}
