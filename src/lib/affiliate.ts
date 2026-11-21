import { TRACKING_URLS } from "./adtraction";

/**
 * Sub-id for affiliate links, so the networks' statistics show clicks and sales
 * per page and per box. Format: `<site>.<page-slug>[.<placement>]`, only
 * `[a-z0-9._-]`. Only page and placement go in, never user data.
 *
 * Parameters (see docs/affiliate-subid.md):
 * - Adtraction: `epi` (up to five EPIs; with a deeplink the `url` parameter must
 *   come last). https://help.adtraction.com/en/articles/1563109-get-started-with-epi
 * - Partner-ads: `uid` (lowercase; before `htmlurl` on deeplinks).
 *   https://www.partner-ads.com/dk/affiliate-svar.php?faqid=60
 */
export const AFFILIATE_SITE = "mb";

export type AffiliateNetwork = "adtraction" | "partner-ads";

interface NetworkSpec {
  param: string;
  /** The deeplink parameter, which the sub-id must be placed in front of. */
  deeplinkParam: string;
  maxLength: number;
}

export const NETWORKS: Record<AffiliateNetwork, NetworkSpec> = {
  // Adtraction: an EPI is at most 128 characters
  // (https://adtraction.com/blog/what-is-epi-and-how-does-it-work).
  adtraction: { param: "epi", deeplinkParam: "url", maxLength: 128 },
  // Partner-ads documents no limit for uid; 64 is a conservative choice.
  "partner-ads": { param: "uid", deeplinkParam: "htmlurl", maxLength: 64 },
};

const ADTRACTION_HOSTS = new Set(
  Object.values(TRACKING_URLS).map((u) => new URL(u).hostname),
);

export function detectNetwork(url: string): AffiliateNetwork | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname.endsWith("partner-ads.com") && parsed.pathname.endsWith("/klikbanner.php")) {
    return "partner-ads";
  }
  if (ADTRACTION_HOSTS.has(parsed.hostname) && parsed.pathname === "/t/t") return "adtraction";
  return null;
}

const DANISH: Record<string, string> = { æ: "ae", ø: "oe", å: "aa" };

function clean(part: string): string {
  return part
    .toLowerCase()
    .replace(/[æøå]/g, (c) => DANISH[c])
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
}

/** Slug of a pathname: "/dagpenge/" -> "dagpenge", "/blog/x" -> "blog-x", "/" -> "forside". */
export function pageSlug(pathname: string): string {
  const segments = pathname.split("/").map(clean).filter(Boolean);
  return segments.join("-") || "forside";
}

export function buildSubid(network: AffiliateNetwork, page: string, placement?: string): string {
  const { maxLength } = NETWORKS[network];
  const cleanPlacement = placement ? clean(placement) : "";
  const tail = cleanPlacement ? `.${cleanPlacement}` : "";
  const head = `${AFFILIATE_SITE}.`;
  const room = Math.max(1, maxLength - head.length - tail.length);
  const slug = (clean(page) || "forside").slice(0, room);
  return `${head}${slug}${tail}`.slice(0, maxLength);
}

/**
 * Adds the sub-id to an affiliate link. Other URLs, and links that already
 * carry the network's parameter, are returned unchanged. Existing parameters
 * and the deeplink's encoding are kept as they are.
 */
export function withSubid(url: string, pathname: string, placement?: string): string {
  const network = detectNetwork(url);
  if (!network) return url;
  const { param, deeplinkParam } = NETWORKS[network];
  const hashAt = url.indexOf("#");
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const qAt = base.indexOf("?");
  if (qAt === -1) return url;
  const path = base.slice(0, qAt);
  const parts = base.slice(qAt + 1).split("&");
  if (parts.some((p) => p.startsWith(`${param}=`))) return url;
  const entry = `${param}=${buildSubid(network, pageSlug(pathname), placement)}`;
  const at = parts.findIndex((p) => p.startsWith(`${deeplinkParam}=`));
  if (at === -1) parts.push(entry);
  else parts.splice(at, 0, entry);
  return `${path}?${parts.join("&")}${hash}`;
}
