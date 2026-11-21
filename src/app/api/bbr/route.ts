import { NextResponse, type NextRequest } from "next/server";
import {
  BBR_GRAPHQL_URL,
  BYGNING_QUERY,
  ENHED_QUERY,
  JORDSTYKKE_QUERY,
  MAT_GRAPHQL_URL,
  type BbrSvar,
  erUuid,
  parseBygninger,
  parseEnheder,
  parseJordstykkeAreal,
  udledBbr,
} from "@/lib/bbr";
import { getDomainConfig } from "@/lib/domain-config";
import { lavRateLimit } from "@/lib/rate-limit";

/**
 * BBR lookup for an address via Datafordeler (Danish locale only).
 *
 * POST /api/bbr with JSON { husnummerId: <uuid>, adresseId?: <uuid> }
 *
 * POST rather than GET so the address ids never appear in the URL and thus not in the access log.
 *
 * - The key (DATAFORDELER_API_KEY) is only read here on the server and never sent to the browser.
 * - Only valid uuids reach Datafordeler, so the route cannot be used as an open proxy.
 * - If the key is missing or Datafordeler fails, we answer 200 { tilgaengelig: false },
 *   so the calculator simply works without BBR.
 * - Nothing is stored or logged about the address.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIMEOUT_MS = 6000;
const GRAENSE_PR_MINUT = 30;
const CACHE_OK = "private, max-age=3600";

// 30 lookups per minute per IP. Not exported: Next only allows route fields in route.ts.
const rateLimit = lavRateLimit(GRAENSE_PR_MINUT);

function klientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "ukendt";
}

const json = (body: BbrSvar | { fejl: string }, status: number, cache: string) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": cache } });

async function graphql(
  url: string,
  apiKey: string,
  query: string,
  variables: Record<string, string>,
  signal: AbortSignal,
): Promise<unknown> {
  const res = await fetch(`${url}?apiKey=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
    cache: "no-store",
  });
  // Never put the URL in the error: it contains the key.
  if (!res.ok) throw new Error(`Datafordeler svarede ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  // BBR is a Danish register and is only offered on the Danish site.
  if (getDomainConfig(req.headers.get("host") || "localhost").locale !== "da") {
    return json({ fejl: "Ikke tilgængelig" }, 404, "no-store");
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    // Invalid JSON is treated as missing ids and gives 400 below.
  }
  const felt = (k: string) => {
    const v = body && typeof body === "object" ? (body as Record<string, unknown>)[k] : null;
    return typeof v === "string" ? v : null;
  };
  const husnummerId = felt("husnummerId");
  const adresseId = felt("adresseId") || null;

  if (!erUuid(husnummerId) || (adresseId !== null && !erUuid(adresseId))) {
    return json({ fejl: "husnummerId og adresseId skal være uuid" }, 400, "no-store");
  }

  if (!rateLimit.tilladt(klientIp(req))) {
    return json({ fejl: "For mange opslag. Prøv igen om et minut." }, 429, "no-store");
  }

  const apiKey = process.env.DATAFORDELER_API_KEY;
  if (!apiKey) return json({ tilgaengelig: false }, 200, "no-store");

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const tid = new Date().toISOString();
  try {
    const [bygJson, enhJson] = await Promise.all([
      graphql(BBR_GRAPHQL_URL, apiKey, BYGNING_QUERY, { husnummer: husnummerId.toLowerCase(), tid }, signal),
      adresseId
        ? graphql(BBR_GRAPHQL_URL, apiKey, ENHED_QUERY, { adresse: adresseId.toLowerCase(), tid }, signal)
        : Promise.resolve(null),
    ]);
    const bygninger = parseBygninger(bygJson);
    const enheder = enhJson === null ? [] : parseEnheder(enhJson);
    if (!bygninger || !enheder) {
      console.warn("[bbr] uventet svar fra Datafordeler");
      return json({ tilgaengelig: false }, 200, "no-store");
    }
    const udledt = udledBbr(bygninger, enheder);
    if (!udledt) return json({ tilgaengelig: true, fundet: false }, 200, CACHE_OK);

    // The plot area is a bonus: if Matrikel fails, the BBR answer still stands.
    let grundareal: number | null = null;
    if (udledt.jordstykke) {
      try {
        grundareal = parseJordstykkeAreal(
          await graphql(MAT_GRAPHQL_URL, apiKey, JORDSTYKKE_QUERY, { id: udledt.jordstykke, tid }, signal),
        );
      } catch (e) {
        console.warn("[bbr] matrikelopslag fejlede:", e instanceof Error ? `${e.name}: ${e.message}` : "ukendt fejl");
      }
    }
    return json({ tilgaengelig: true, fundet: true, ...udledt.data, grundareal }, 200, CACHE_OK);
  } catch (e) {
    console.warn("[bbr] opslag fejlede:", e instanceof Error ? `${e.name}: ${e.message}` : "ukendt fejl");
    return json({ tilgaengelig: false }, 200, "no-store");
  }
}
