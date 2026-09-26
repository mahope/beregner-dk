import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { SATSER_2026 } from "@/lib/satser-2026";
import ArveafgiftGuidePage, { generateMetadata } from "./page";

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const html = () => renderToStaticMarkup(ArveafgiftGuidePage());

describe("arveafgift-regler-og-satser artiklen", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("titlen og H1 er svar-først med et konkret 2026-tal", async () => {
    const meta = await generateMetadata();

    expect(meta.title).toBe("Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.");
    expect(html()).toContain("Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.");
  });

  test("bundfradrag og satser læses fra den centrale konfiguration", () => {
    const markup = html();
    const bundfradrag = new Intl.NumberFormat("da-DK").format(
      SATSER_2026.arveBundfradrag,
    );

    expect(markup).toContain(bundfradrag);
    expect(bundfradrag).toBe("392.300");
    expect(markup).toContain("91.155 kr");
  });

  test("søskende-eksemplet følger beregnerens tillægsafgift på resten", () => {
    const markup = html();
    const grundlag = 800000 - SATSER_2026.arveBundfradrag;
    const boafgift = grundlag * SATSER_2026.boafgift;
    const tillaeg = (800000 - boafgift) * SATSER_2026.tillaegsboafgift;
    const samlet = boafgift + tillaeg;
    const format = (v: number) => new Intl.NumberFormat("da-DK").format(Math.round(v));

    expect(format(grundlag)).toBe("407.700");
    expect(format(boafgift)).toBe("61.155");
    expect(format(tillaeg)).toBe("184.711");
    expect(format(samlet)).toBe("245.866");
    expect(format(800000 - samlet)).toBe("554.134");
    expect(markup).toContain("184.711 kr");
    expect(markup).toContain("245.866 kr");
    expect(markup).toContain("554.134 kr");
  });

  test("de tre dokumenterede fejl er væk", () => {
    const markup = html();

    // 1) eksemplet tog 25 % af afgiftsgrundlaget i stedet for resten efter boafgift
    expect(markup).not.toContain("86.636");
    expect(markup).not.toContain("147.791");
    expect(markup).not.toContain("652.209");
    // 2) tabellen sagde "15 % + 25 %" uden at gøre grundlaget for tillægsafgiften klart
    expect(markup).toContain("% af beløbet efter boafgift");
    // 3) gaver over grænsen blev deklareret som "15 % gaveafgift" uden kilde
    expect(markup).not.toContain("15% gaveafgift");
  });

  test("artiklen linker til beregneren tidligt, og siden linker tilbage", () => {
    const markup = html();
    const firstCta = markup.indexOf('href="/arveafgift"');
    const thirdSection = markup.indexOf("Sådan beregnes arveafgiften");

    expect(firstCta).toBeGreaterThan(-1);
    expect(firstCta).toBeLessThan(thirdSection);
  });
});
