/**
 * Titel- og description-port for hele sitet, pr. domæne.
 *
 * Search Console (28 dage til 6/11-2026) viser CTR 0,5 % på minberegner.dk og
 * 0,1 % på beraknare.se trods position 5-9. En titel, der er afkortet, er den
 * samme som en anden sides, eller står på et andet sprog end domænet, taber
 * klikket, så porten læser den tekst der rent faktisk havner i `<head>` (via
 * hver sides `generateMetadata`) og dømmer tre ting pr. domæne:
 *
 *  1. ingen to indekserbare sider har samme titel,
 *  2. ingen titel er længere end `MAX_TITEL`, og
 *  3. de sider, titlerne er målrettet i GSC, har en beskrivelse på 140-155 tegn.
 *
 * Danske slugs på svenske sider dømmes i `lib/locale-slugs.test.ts`.
 */
import { describe, expect, test, vi } from "vitest";
import { getAllCategorySlugs } from "@/lib/categories";
import { getDageTilPrefix, getDageTilSlugs } from "@/lib/dage-til";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import { getKlokkenPrefix, getKlokkenSlugs } from "@/lib/klokken-i";
import { localizedPath } from "@/lib/locale-slugs";
import { getRouteDecision } from "@/lib/routing";

const host = vi.hoisted(() => ({ locale: "da" as Locale }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: async () => host.locale,
  getCurrentDomainConfig: async () => getDomainConfigByLocale(host.locale),
}));

/** Googles synlige titelbredde er ~60 tegn; 65 er den hårde grænse i porten. */
const MAX_TITEL = 65;

type Metadata = {
  title?: unknown;
  description?: unknown;
  robots?: { index?: boolean } | string;
};
type Params = { dato: string; slug: string; land: string };
type SideModul = {
  metadata?: Metadata;
  generateMetadata?: (props: {
    params: Promise<Params>;
    searchParams: Promise<Record<string, never>>;
  }) => Promise<Metadata>;
};

const PAGE_MODULER = (
  import.meta.glob as unknown as (
    pattern: string,
  ) => Record<string, () => Promise<SideModul>>
)("./**/page.tsx");

const IKKE_INDEKSERET = ["/embed/", "/design-system", "/locale-unavailable"];

function titelTekst(title: unknown): string | undefined {
  if (typeof title === "string") return title;
  if (title && typeof title === "object") {
    const t = title as { absolute?: string; default?: string };
    return t.absolute ?? t.default;
  }
  return undefined;
}

function erNoindex(meta: Metadata): boolean {
  const robots = meta.robots;
  if (!robots) return false;
  if (typeof robots === "string") return robots.includes("noindex");
  return robots.index === false;
}

interface Side {
  rute: string;
  titel: string;
  beskrivelse: string | undefined;
}

async function samlSider(locale: Locale): Promise<Side[]> {
  host.locale = locale;
  const config = getDomainConfigByLocale(locale);
  const sider: Side[] = [];

  const dynamiske = new Map<string, string[]>();
  const dageTil = getDageTilPrefix(locale);
  if (dageTil) dynamiske.set(`${dageTil.replace(/\/$/, "")}/[dato]`, getDageTilSlugs(locale));
  const klokken = getKlokkenPrefix(locale);
  if (klokken) {
    dynamiske.set(
      `${klokken.replace(/\/$/, "")}/[land]`,
      getKlokkenSlugs(locale === "se" ? "se" : "da"),
    );
  }
  if (locale === "da") dynamiske.set("/kategori/[slug]", getAllCategorySlugs());

  for (const [nøgle, hent] of Object.entries(PAGE_MODULER)) {
    const mappe = `/${nøgle.replace(/^\.\//, "").replace(/page\.tsx$/, "").replace(/\/$/, "")}`;
    if (IKKE_INDEKSERET.some((p) => mappe.startsWith(p))) continue;
    const mod = await hent();

    const værdier = mappe.includes("[") ? (dynamiske.get(mappe) ?? []) : [null];
    for (const værdi of værdier) {
      const rute = værdi === null ? mappe : mappe.replace(/\[[^\]]+\]/, værdi);
      // Siden hedder mappens navn internt, men det offentlige slug på domænet.
      const offentlig = localizedPath(rute, locale);
      const beslutning = getRouteDecision(config, offentlig).type;
      if (beslutning !== "allow" && beslutning !== "rewrite") continue;

      const params = Promise.resolve({
        dato: værdi ?? "1-december",
        slug: værdi ?? "oekonomi",
        land: værdi ?? "usa",
      });
      const meta =
        mod.metadata ??
        (await mod.generateMetadata?.({ params, searchParams: Promise.resolve({}) }));
      if (!meta || erNoindex(meta)) continue;
      const titel = titelTekst(meta.title);
      if (!titel) continue;
      sider.push({
        rute: offentlig,
        titel,
        beskrivelse: typeof meta.description === "string" ? meta.description : undefined,
      });
    }
  }
  return sider;
}

describe.each(["da", "se"] as const)("titler på %s", (locale) => {
  test("sitet har sider at dømme", async () => {
    expect((await samlSider(locale)).length).toBeGreaterThan(60);
  }, 60000);

  test("ingen to sider har samme titel", async () => {
    const sider = await samlSider(locale);
    const set = new Map<string, string[]>();
    for (const s of sider) {
      const nøgle = s.titel.trim().toLowerCase();
      set.set(nøgle, [...(set.get(nøgle) ?? []), s.rute]);
    }
    const dubletter = [...set.entries()]
      .filter(([, ruter]) => ruter.length > 1)
      .map(([titel, ruter]) => `"${titel}" -> ${ruter.join(", ")}`);
    expect(dubletter).toEqual([]);
  }, 60000);

  test(`ingen titel er længere end ${MAX_TITEL} tegn`, async () => {
    const lange = (await samlSider(locale))
      .filter((s) => s.titel.length > MAX_TITEL)
      .map((s) => `${s.rute} (${s.titel.length}): ${s.titel}`);
    expect(lange).toEqual([]);
  }, 60000);
});

/**
 * Siderne GSC viser med flest visninger og lavest CTR. Beskrivelsen er det
 * andet, der står i snippet'en, så den skal fylde den (140-155 tegn), men ikke
 * så meget at Google skærer slutningen af.
 */
const MAL_SIDER: Record<"da" | "se", string[]> = {
  da: [
    "/dato", "/tidsberegner", "/afstand-mellem-adresser", "/kvadratmeter", "/su",
    "/rentefradrag", "/barselsdagpenge", "/husleje", "/alder", "/nedtaelling",
    "/tidszone", "/procent", "/moms", "/boligstoette", "/promille", "/bmi",
  ],
  se: ["/datum", "/tidskalkylator", "/nedrakning", "/alder", "/tidszon"],
};

/**
 * De genererede nedtællingssider (`/dagar-till/*`, `/dage-til/*`) får deres
 * description sat sammen af svar, dato, ugedag og «det svarer til», så længden
 * følger begivenhedens navn: 122-155 tegn. Den kan ikke gøres konstant uden at
 * fylde teksten ud, så porten dømmer det, der betyder noget: at den ikke er så
 * kort at snippet'en står halvtom, og at Google ikke skærer den.
 */
const GENERERET_MIN = 120;
const GENERERET_MAX = 160;

describe.each(["da", "se"] as const)("genererede nedtællingssider, %s", (locale) => {
  test(`description er ${GENERERET_MIN}-${GENERERET_MAX} tegn`, async () => {
    const sider = (await samlSider(locale)).filter((s) => /^\/(dage-til|dagar-till)\//.test(s.rute));
    expect(sider.length).toBeGreaterThan(10);
    const forkerte = sider
      .filter((s) => !s.beskrivelse || s.beskrivelse.length < GENERERET_MIN || s.beskrivelse.length > GENERERET_MAX)
      .map((s) => `${s.rute} (${s.beskrivelse?.length})`);
    expect(forkerte).toEqual([]);
  }, 60000);

  test("svensk description bruger svenske ord, ikke danske", async () => {
    if (locale !== "se") return;
    const sider = (await samlSider("se")).filter((s) => s.rute.startsWith("/dagar-till/"));
    const danske = sider.filter((s) => / er en | og /.test(s.beskrivelse ?? "")).map((s) => s.rute);
    expect(danske).toEqual([]);
  }, 60000);
});

describe.each(["da", "se"] as const)("beskrivelser på målsiderne, %s", (locale) => {
  test("er 140-155 tegn", async () => {
    const sider = new Map((await samlSider(locale)).map((s) => [s.rute, s]));
    const uden: string[] = [];
    const forkerte: string[] = [];
    for (const rute of MAL_SIDER[locale]) {
      const side = sider.get(rute);
      if (!side?.beskrivelse) {
        uden.push(rute);
        continue;
      }
      const n = side.beskrivelse.length;
      if (n < 140 || n > 155) forkerte.push(`${rute} (${n})`);
    }
    expect(uden, "sider uden beskrivelse").toEqual([]);
    expect(forkerte, "beskrivelser uden for 140-155 tegn").toEqual([]);
  }, 60000);
});
