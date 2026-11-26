// Pure helpers for the optional "Din virksomhed" CVR field on /moms.
//
// Privacy rules live here so they can be unit tested:
// - The visitor's IP is cut to its network prefix (/24 for IPv4, /48 for IPv6) by
//   `ipPrefiks` and the full address is never passed on, stored or logged.
// - A mail address is reduced to its domain by `mailDomaene`; the local part never leaves.
// - Without consent the request to cvrradar carries no IP prefix and no mail domain,
//   so cvrradar has nothing to learn from.
// - Only company fields are read from cvrradar's answer (never owners or directors).
// Contract: docs/moms-cvr.md (cvrradar: mahope/cvr, src/beregner/web.ts).

import { type CvrradarFrist, type Momsperiode, isoDato } from "@/lib/momsfrister";

export const CVRRADAR_BEREGNER_URL = "https://cvrradar.dk/v1/intern/beregner";
/** Withdrawal page ("Slet vores virksomheds netværk") hosted by cvrradar. */
export const CVRRADAR_TILBAGETRAEK_URL = "https://cvrradar.dk/slet-netvaerk";
/**
 * Consent scope sent with a ticked box. The checkbox text covers both our own sites and
 * cvrradar.dk's services to companies, which is cvrradar's widest scope ("cvrradar-kunder").
 * cvrradar accepts "none" | "egne-sites" | "cvrradar-kunder".
 */
export const SAMTYKKE_SCOPE = "cvrradar-kunder" as const;

/** Feature flag. Off unless NEXT_PUBLIC_MOMS_CVR is "1" or "true" (inlined at build time). */
export function isMomsCvrEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_MOMS_CVR;
  return v === "1" || v === "true";
}

/** Strips spaces, dashes and a "DK" prefix. Returns digits only (may be the wrong length). */
export function rensCvr(input: string): string {
  return input.trim().replace(/^dk/i, "").replace(/[\s.-]/g, "");
}

const CVR_VAEGTE = [2, 7, 6, 5, 4, 3, 2, 1];

/** True for an 8-digit CVR number that passes the modulus-11 check. */
export function erGyldigtCvr(cvr: unknown): cvr is string {
  if (typeof cvr !== "string" || !/^[1-9]\d{7}$/.test(cvr)) return false;
  const sum = CVR_VAEGTE.reduce((s, v, i) => s + v * Number(cvr[i]), 0);
  return sum % 11 === 0;
}

function ipv4Dele(ip: string): number[] | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const dele = m.slice(1).map(Number);
  return dele.every((d) => d <= 255) ? dele : null;
}

function ipv4ErPrivat([a, b]: number[]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    // Same reserved nets cvrradar rejects (it answers 400 on them): 192.0.0.0/16 and 198.18.0.0/15.
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Expands an IPv6 address to 8 numeric groups, or null if it is not valid IPv6. */
function ipv6Grupper(ip: string): number[] | null {
  let adr = ip.toLowerCase().split("%")[0];
  // An embedded IPv4 tail (::ffff:1.2.3.4) becomes two hex groups.
  const v4 = adr.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4) {
    const d = ipv4Dele(v4[2]);
    if (!d) return null;
    adr = `${v4[1]}${((d[0] << 8) | d[1]).toString(16)}:${((d[2] << 8) | d[3]).toString(16)}`;
  }
  const halvdele = adr.split("::");
  if (halvdele.length > 2) return null;
  const del = (s: string) => (s === "" ? [] : s.split(":"));
  const venstre = del(halvdele[0]);
  const hoejre = halvdele.length === 2 ? del(halvdele[1]) : [];
  const mangler = 8 - venstre.length - hoejre.length;
  if (halvdele.length === 1 ? mangler !== 0 : mangler < 1) return null;
  const grupper = [...venstre, ...Array(halvdele.length === 2 ? mangler : 0).fill("0"), ...hoejre];
  if (!grupper.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return grupper.map((g) => parseInt(g, 16));
}

/**
 * Cuts an IP address to its network prefix: a.b.c.0/24 for IPv4 and the first three
 * groups /48 for IPv6. IPv4-mapped IPv6 is treated as IPv4. Returns null for invalid,
 * private, loopback, link-local and multicast addresses (nothing worth recognising).
 */
export function ipPrefiks(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const ren = ip.trim().replace(/^\[|\]$/g, "");
  const v4 = ipv4Dele(ren);
  if (v4) return ipv4ErPrivat(v4) ? null : `${v4[0]}.${v4[1]}.${v4[2]}.0/24`;

  const g = ipv6Grupper(ren);
  if (!g) return null;
  // ::ffff:a.b.c.d (IPv4-mapped)
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) {
    return ipPrefiks(`${g[6] >> 8}.${g[6] & 255}.${g[7] >> 8}.${g[7] & 255}`);
  }
  // Only global unicast (2000::/3) is worth a prefix: skips ::1, fc00::/7, fe80::/10, ff00::/8.
  // The documentation net 2001:db8::/32 is rejected by cvrradar too.
  if ((g[0] & 0xe000) !== 0x2000 || (g[0] === 0x2001 && g[1] === 0x0db8)) return null;
  return `${g.slice(0, 3).map((x) => x.toString(16)).join(":")}::/48`;
}

/**
 * Header the visitor's IP is read from. minberegner.dk is behind Cloudflare, which always
 * overwrites CF-Connecting-IP with the address it saw. X-Forwarded-For is never used: Cloudflare
 * keeps whatever the browser sent there and only appends, so its first entry can be forged, and
 * that would tie someone else's network to a CVR (and dodge the rate limit).
 * MOMS_CVR_IP_HEADER can name another single-value header for a different proxy setup.
 */
export function klientIpHeader(): string {
  return (process.env.MOMS_CVR_IP_HEADER || "cf-connecting-ip").trim().toLowerCase();
}

/** The client IP from the trusted proxy header, or null. A list or anything with spaces is refused. */
export function klientIpFraHeaders(h: Headers): string | null {
  const vaerdi = h.get(klientIpHeader())?.trim();
  if (!vaerdi || /[\s,]/.test(vaerdi)) return null;
  return vaerdi;
}

/** Returns only the domain of a mail address (lower case), or null. The local part is dropped. */
export function mailDomaene(mail: unknown): string | null {
  if (typeof mail !== "string") return null;
  const at = mail.lastIndexOf("@");
  if (at < 1) return null;
  const domaene = mail.slice(at + 1).trim().toLowerCase().replace(/\.$/, "");
  return /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domaene) ? domaene : null;
}

/** Body for cvrradar's POST /v1/intern/beregner (field names are cvrradar's). */
export interface CvrradarForespoergsel {
  cvr: string;
  /** SAMTYKKE_SCOPE when the visitor ticked the consent box, otherwise "none" (nothing is learned). */
  samtykke: typeof SAMTYKKE_SCOPE | "none";
  /** The visitor states the CVR is their own company (part of the same checkbox). */
  eget: boolean;
  /** Network prefix (/24 or /48), only with consent. */
  ip_praefiks?: string;
  /** Mail domain without the local part, only with consent. */
  maildomaene?: string;
}

// Only shapes `ipPrefiks` can produce; a full address passed by mistake is dropped.
const PREFIKS_RE = /^(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.0\/24|[0-9a-f]{1,4}:[0-9a-f]{1,4}:[0-9a-f]{1,4}::\/48)$/;

/**
 * Builds the body sent to cvrradar. Takes an already cut network prefix and reduces the
 * mail to its domain; neither the full IP nor the mail local part can be in the output.
 */
export function byggeCvrradarForespoergsel(input: {
  cvr: string;
  samtykke: boolean;
  /** Output of `ipPrefiks`; the caller cuts the IP before anything else happens. */
  ipPrefiks?: string | null;
  mail?: unknown;
}): CvrradarForespoergsel {
  const body: CvrradarForespoergsel = {
    cvr: input.cvr,
    samtykke: input.samtykke ? SAMTYKKE_SCOPE : "none",
    eget: input.samtykke,
  };
  if (input.samtykke) {
    if (input.ipPrefiks && PREFIKS_RE.test(input.ipPrefiks)) body.ip_praefiks = input.ipPrefiks;
    const domaene = mailDomaene(input.mail);
    if (domaene) body.maildomaene = domaene;
  }
  return body;
}

export type Momsregistreret = "ja" | "nej" | "ukendt";
/** How cvrradar estimated the VAT period. */
export type Momsgrundlag = "omsaetning" | "bruttofortjeneste" | "ny_virksomhed" | "ukendt";

/** cvrradar's answer, whitelisted. A non-company (ENK, PMV, I/S ...) carries no name or VAT data. */
export type CvrradarSvar =
  | { selskab: false; gemt: false }
  | {
      selskab: true;
      navn: string | null;
      aktiv: boolean;
      momsregistreret: Momsregistreret;
      momsperiode: Momsperiode | null;
      grundlag: Momsgrundlag;
      /** Financial year the estimate is based on (only for turnover/gross profit). */
      regnskabsaar: string | null;
      /** Next deadlines from cvrradar, already moved to bank days. */
      frister: CvrradarFrist[];
      /** cvrradar stored an observation of the network. Learning needs a further confirmation. */
      gemt: boolean;
    };

/** What /api/cvr answers the browser. */
export type CvrApiSvar =
  | { tilgaengelig: false }
  | { tilgaengelig: true; fundet: false }
  | { tilgaengelig: true; fundet: true; selskab: false; cvr: string }
  | ({ tilgaengelig: true; fundet: true; cvr: string } & Extract<CvrradarSvar, { selskab: true }>);

const PERIODER: readonly Momsperiode[] = ["maaned", "kvartal", "halvaar"];
const GRUNDLAG: readonly Momsgrundlag[] = ["omsaetning", "bruttofortjeneste", "ny_virksomhed", "ukendt"];
const MAKS_FRISTER = 12;

function frister(v: unknown): CvrradarFrist[] {
  if (!Array.isArray(v)) return [];
  const ud: CvrradarFrist[] = [];
  for (const f of v.slice(0, MAKS_FRISTER)) {
    if (!f || typeof f !== "object") continue;
    const { fra, til, frist } = f as Record<string, unknown>;
    if (isoDato(fra) && isoDato(til) && isoDato(frist)) {
      ud.push({ fra: fra as string, til: til as string, frist: frist as string });
    }
  }
  return ud;
}

/**
 * Whitelists the company fields from cvrradar's answer. Anything else (persons) is dropped,
 * and a non-company keeps nothing but `selskab: false`.
 */
export function parseCvrradarSvar(json: unknown): CvrradarSvar | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (o.selskab === false) return { selskab: false, gemt: false };
  if (o.selskab !== true) return null;
  const moms = o.moms && typeof o.moms === "object" ? (o.moms as Record<string, unknown>) : {};
  const observation =
    o.observation && typeof o.observation === "object" ? (o.observation as Record<string, unknown>) : {};
  const momsperiode = PERIODER.includes(moms.periode as Momsperiode) ? (moms.periode as Momsperiode) : null;
  const registreret = moms.registreret;
  return {
    selskab: true,
    navn: typeof o.navn === "string" && o.navn.trim() ? o.navn.trim().slice(0, 200) : null,
    aktiv: o.aktiv !== false,
    momsregistreret: registreret === "ja" || registreret === "nej" ? registreret : "ukendt",
    momsperiode,
    grundlag: GRUNDLAG.includes(moms.grundlag as Momsgrundlag) ? (moms.grundlag as Momsgrundlag) : "ukendt",
    regnskabsaar:
      typeof moms.regnskabsaar === "string" && moms.regnskabsaar.trim() ? moms.regnskabsaar.trim().slice(0, 40) : null,
    frister: momsperiode ? frister(moms.frister) : [],
    gemt: observation.gemt === true,
  };
}
