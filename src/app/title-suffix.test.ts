import { readdirSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale, getAllDomainConfigs } from "@/lib/domain-config";
import { getAllCategorySlugs } from "@/lib/categories";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { generateMetadata as cookiepolitikMetadata } from "./cookiepolitik/page";
import { generateMetadata as kategoriMetadata } from "./kategori/[slug]/page";
import { generateMetadata as privatlivspolitikMetadata } from "./privatlivspolitik/page";

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: vi.fn(),
  getLocale: vi.fn(),
}));

function titleOf(metadata: { title?: unknown }): string {
  const title = metadata.title;
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "absolute" in title) {
    return String((title as { absolute: string }).absolute);
  }
  return String(title ?? "");
}

const locales = getAllDomainConfigs().map((config) => config.locale);

describe("sidetitler får domænenavnet præcis én gang", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  // layoutets `title.template` tilføjer domænenavnet. En side der selv
  // skriver domænenavnet i titlen får derfor dobbelt suffiks, som var
  // tilfældet på alle ti kategorisider samt de to juridiske sider.
  test.each(locales)("kategorisiderne skriver ikke domænenavnet i titlen (%s)", async (locale) => {
    const config = getDomainConfigByLocale(locale);
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(config);

    for (const slug of getAllCategorySlugs()) {
      const title = titleOf(await kategoriMetadata({ params: Promise.resolve({ slug }) }));
      expect(title.length, slug).toBeGreaterThan(0);
      expect(title, slug).not.toContain(config.siteName);
    }
  });

  test.each(locales)("privatlivspolitik skriver ikke domænenavnet i titlen (%s)", async (locale) => {
    const config = getDomainConfigByLocale(locale);
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(config);

    const title = titleOf(await privatlivspolitikMetadata());
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toContain(config.siteName);
  });

  test.each(locales)("cookiepolitik skriver ikke domænenavnet i titlen (%s)", async (locale) => {
    const config = getDomainConfigByLocale(locale);
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(config);

    const title = titleOf(await cookiepolitikMetadata());
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toContain(config.siteName);
  });
});

// Layoutets template er `%s | <siteName>`, så en metadata-titel der *ikke*
// bruger `absolute` får domænenavnet hæftet på. Titlen Google ser er derfor
// `title + " | MinBeregner.dk"` (18 tegn) og ikke længden af det, siden
// skriver. De 160 `page-data`-titler bruger `absolute`
// (`src/lib/page-helpers.ts:38`) og er låst af `page-data.test.ts` — blog og
// kategori gjorde ikke, og alle 28 af dem landede i 61-73 tegn.
//
// Målingen skal derfor tage den *renderede* titel, altså den template-løste,
// og det er derfor denne test kalder den rigtige producer frem for at genskabe
// udtrykket (C44's lære).
function renderedTitle(metadata: { title?: unknown }, siteName: string): string {
  const title = metadata.title;
  if (title && typeof title === "object" && "absolute" in title) {
    return String((title as { absolute: string }).absolute);
  }
  const own = titleOf(metadata);
  return own ? `${own} | ${siteName}` : "";
}

const GOOGLE_TITLE_LIMIT = 60;

describe("renderede sidetitler overlever Googles afkortning", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("de ti kategorisider er ≤ 60 tegn i den renderede titel", async () => {
    const config = getDomainConfigByLocale("da");
    const offenders: string[] = [];

    for (const slug of getAllCategorySlugs()) {
      const metadata = await kategoriMetadata({ params: Promise.resolve({ slug }) });
      const rendered = renderedTitle(metadata, config.siteName);
      expect(rendered.length, slug).toBeGreaterThan(0);
      if (rendered.length > GOOGLE_TITLE_LIMIT) {
        offenders.push(`${slug}: ${rendered.length} tegn — "${rendered}"`);
      }
    }

    expect(offenders).toEqual([]);
  });

  test("alle blogindlæg er ≤ 60 tegn i den renderede titel", async () => {
    const config = getDomainConfigByLocale("da");
    const blogDir = join(process.cwd(), "src", "app", "blog");
    const slugs = readdirSync(blogDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(slugs.length).toBeGreaterThan(20);

    const offenders: string[] = [];
    for (const slug of slugs) {
      const module = await import(`./blog/${slug}/page.tsx`);
      const rendered = renderedTitle(await module.generateMetadata(), config.siteName);
      expect(rendered.length, slug).toBeGreaterThan(0);
      if (rendered.length > GOOGLE_TITLE_LIMIT) {
        offenders.push(`${slug}: ${rendered.length} tegn — "${rendered}"`);
      }
    }

    expect(offenders).toEqual([]);
  });

  // `openGraph.title` går ikke gennem layoutets template, så brandet skal
  // stadig sendes med til Facebook og LinkedIn. Uden `siteName` i
  // `openGraph` forsvinder brandet fra delingerne, selv om `<title>` er
  // kort nok.
  test("kategorisiderne sender stadig brandet med i openGraph", async () => {
    const config = getDomainConfigByLocale("da");
    const metadata = await kategoriMetadata({
      params: Promise.resolve({ slug: getAllCategorySlugs()[0] }),
    });
    const openGraph = (metadata as { openGraph?: { siteName?: string } }).openGraph;
    expect(openGraph?.siteName).toBe(config.siteName);
  });
});
