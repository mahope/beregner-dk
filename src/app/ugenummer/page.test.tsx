import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import UgenummerPage from "./page";

vi.mock("@/components/UgenummerBeregner", () => ({
  default: () => <div>Ugeværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
  ArticleSchema: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

// GSC 22/10-19/11-2026: "hvilken uge er vi i" 5.230 visninger pos. 10,1, 0 klik.
describe("ugenummer page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });
  afterEach(() => vi.useRealTimers());

  test("svarer med dagens ugenummer øverst, før værktøjet", async () => {
    vi.setSystemTime(new Date("2026-11-21T10:00:00Z")); // lørdag, uge 47
    const html = renderToStaticMarkup(await UgenummerPage());
    expect(html).toContain("Vi er i uge <strong>47</strong> i 2026");
    expect(html).toMatch(/lørdag (den )?21\. november 2026/);
    expect(html.indexOf("Vi er i uge")).toBeLessThan(html.indexOf("Ugeværktøj"));
  });

  test("ved årsskiftet bruger svaret ISO-året", async () => {
    vi.setSystemTime(new Date("2027-01-01T10:00:00Z")); // fredag, uge 53 i 2026
    const html = renderToStaticMarkup(await UgenummerPage());
    expect(html).toContain("Vi er i uge <strong>53</strong> i 2026");
  });

  test("svensk domæne får ikke det danske svar", async () => {
    vi.setSystemTime(new Date("2026-11-21T10:00:00Z"));
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    // Ugenummer er kun et dansk slug; siden falder tilbage på dansk data, men
    // svarblokken er kun for da-domænet.
    const html = renderToStaticMarkup(await UgenummerPage());
    expect(html).not.toContain("Vi er i uge");
  });
});
