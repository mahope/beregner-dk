// Pure helpers for the optional "Din virksomhed" CVR field on /moms.
//
// Privacy rules live here so they can be unit tested:
// - The visitor's IP is cut to its network prefix (/24 for IPv4, /48 for IPv6) by
//   `ipPrefiks` and the full address is never passed on, stored or logged.
// - A mail address is reduced to its domain by `mailDomaene`; the local part never leaves.
// - Without consent the request to cvrradar carries no IP prefix and no mail domain,
//   so cvrradar has nothing to learn from.
// - Only company fields are read from cvrradar's answer (never owners or directors).
// Contract: docs/moms-cvr.md.

import type { Momsperiode } from "@/lib/momsfrister";

export const CVRRADAR_BEREGNER_URL = "https://cvrradar.dk/v1/intern/beregner";
/** Withdrawal page ("Slet vores virksomheds netværk") hosted by cvrradar. */
export const CVRRADAR_TILBAGETRAEK_URL = "https://cvrradar.dk/slet-netvaerk";
export const MOMS_CVR_KILDE = "minberegner.dk/moms";
export const SAMTYKKE_SCOPE = "begge" as const;

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
  if ((g[0] & 0xe000) !== 0x2000) return null;
  return `${g.slice(0, 3).map((x) => x.toString(16)).join(":")}::/48`;
}

/** Reads the client IP from proxy headers (first X-Forwarded-For entry, else X-Real-IP). */
export function klientIpFraHeaders(h: Headers): string | null {
  const fwd = h.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : h.get("x-real-ip"))?.trim() || null;
}

/** Returns only the domain of a mail address (lower case), or null. The local part is dropped. */
export function mailDomaene(mail: unknown): string | null {
  if (typeof mail !== "string") return null;
  const at = mail.lastIndexOf("@");
  if (at < 1) return null;
  const domaene = mail.slice(at + 1).trim().toLowerCase().replace(/\.$/, "");
  return /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domaene) ? domaene : null;
}

export interface CvrradarForespoergsel {
  cvr: string;
  kilde: string;
  /** "begge" = visitor ticked the consent box; "ingen" = cvrradar must not learn anything. */
  samtykke: typeof SAMTYKKE_SCOPE | "ingen";
  /** The visitor states the CVR is their own company (part of the same checkbox). */
  eget: boolean;
  /** Network prefix, only with consent. */
  ipPrefiks?: string;
  /** Mail domain, only with consent. */
  mailDomaene?: string;
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
    kilde: MOMS_CVR_KILDE,
    samtykke: input.samtykke ? SAMTYKKE_SCOPE : "ingen",
    eget: input.samtykke,
  };
  if (input.samtykke) {
    if (input.ipPrefiks && PREFIKS_RE.test(input.ipPrefiks)) body.ipPrefiks = input.ipPrefiks;
    const domaene = mailDomaene(input.mail);
    if (domaene) body.mailDomaene = domaene;
  }
  return body;
}

export interface CvrradarSvar {
  fundet: boolean;
  navn: string | null;
  /** true/false when known; null when cvrradar does not know. */
  momsregistreret: boolean | null;
  /** Latest annual turnover in DKK, when published. */
  omsaetning: number | null;
  /** Explicit period from cvrradar, if it knows better than the turnover rule. */
  momsperiode: Momsperiode | null;
  /** True when cvrradar stored the network prefix (consent given and accepted). */
  laert: boolean;
}

/** What /api/cvr answers the browser. */
export type CvrApiSvar =
  | { tilgaengelig: false }
  | { tilgaengelig: true; fundet: false }
  | {
      tilgaengelig: true;
      fundet: true;
      cvr: string;
      navn: string | null;
      momsregistreret: boolean | null;
      momsperiode: Momsperiode;
      /** Where the period comes from: cvrradar, the turnover rule, or the start rule. */
      momsperiodeKilde: "cvrradar" | "omsaetning" | "standard";
      omsaetning: number | null;
      laert: boolean;
    };

const PERIODER: readonly Momsperiode[] = ["maaned", "kvartal", "halvaar"];

/** Whitelists the company fields from cvrradar's answer. Anything else (persons) is dropped. */
export function parseCvrradarSvar(json: unknown): CvrradarSvar | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (typeof o.fundet !== "boolean") return null;
  const tal = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);
  return {
    fundet: o.fundet,
    navn: typeof o.navn === "string" && o.navn.trim() ? o.navn.trim().slice(0, 200) : null,
    momsregistreret: typeof o.momsregistreret === "boolean" ? o.momsregistreret : null,
    omsaetning: tal(o.omsaetning),
    momsperiode: PERIODER.includes(o.momsperiode as Momsperiode) ? (o.momsperiode as Momsperiode) : null,
    laert: o.laert === true,
  };
}
