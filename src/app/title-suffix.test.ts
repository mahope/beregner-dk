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
