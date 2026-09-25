import { type NextRequest, NextResponse } from "next/server";
import { RoutingOptagetError, erIDanmark, findRute, parseKoordinat } from "@/lib/rute";

// Driving distance between two Danish points for the befordringsfradrag calculator.
// Only coordinates reach this route (addresses are resolved in the browser via Adressevælger).
// Nothing is stored or logged; results are kept in an in-memory cache keyed on rounded coordinates.

const VINDUE_MS = 60_000;
const MAX_PR_VINDUE = 12;
const kald = new Map<string, number[]>();

function klientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "ukendt";
}

function overGraensen(ip: string, nu = Date.now()): boolean {
  const seneste = (kald.get(ip) ?? []).filter((t) => nu - t < VINDUE_MS);
  if (seneste.length >= MAX_PR_VINDUE) {
    kald.set(ip, seneste);
    return true;
  }
  seneste.push(nu);
  kald.set(ip, seneste);
  if (kald.size > 5000) {
    for (const [k, v] of kald) if (!v.some((t) => nu - t < VINDUE_MS)) kald.delete(k);
  }
  return false;
}

// POST with a JSON body, so the coordinates never end up in URLs or access logs.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { fra?: unknown; til?: unknown } | null;
  const fra = parseKoordinat(typeof body?.fra === "string" ? body.fra : null);
  const til = parseKoordinat(typeof body?.til === "string" ? body.til : null);
  if (!fra || !til || !erIDanmark(fra) || !erIDanmark(til)) {
    return NextResponse.json({ error: "Angiv fra og til som lat,lon i Danmark" }, { status: 400 });
  }

  if (overGraensen(klientIp(req))) {
    return NextResponse.json({ error: "For mange opslag. Prøv igen om lidt." }, { status: 429, headers: { "Retry-After": "60" } });
  }

  try {
    const rute = await findRute(fra, til);
    return NextResponse.json(
      {
        km: Math.round(rute.km * 10) / 10,
        faerge: rute.faerge,
        betalingsbro: rute.betalingsbro,
        kmMedFaerge: rute.kmMedFaerge === null ? null : Math.round(rute.kmMedFaerge * 10) / 10,
        kilde: rute.kilde,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const status = e instanceof RoutingOptagetError ? 503 : 502;
    return NextResponse.json({ error: "Afstanden kunne ikke beregnes lige nu." }, { status });
  }
}
