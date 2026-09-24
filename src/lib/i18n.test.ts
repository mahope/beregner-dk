import { describe, test, expect } from "vitest";
import { getTranslations, t } from "./i18n";

describe("getTranslations", () => {
  test("returns DA translations by default", () => {
    const trans = getTranslations();
    expect(trans.site.name).toBe("MinBeregner.dk");
  });

  test("returns DA translations for da locale", () => {
    const trans = getTranslations("da");
    expect(trans.site.name).toBe("MinBeregner.dk");
  });

  test("returns SE translations for se locale", () => {
    const trans = getTranslations("se");
    expect(trans.site.name).toBe("Beräknare.se");
  });

  test("returns NO translations for no locale", () => {
    const trans = getTranslations("no");
    expect(trans.site.name).toBe("Beregner.no");
  });

  test("all locales have same top-level keys", () => {
    const da = getTranslations("da");
    const no = getTranslations("no");
    const se = getTranslations("se");
    const daKeys = Object.keys(da).sort();
    const noKeys = Object.keys(no).sort();
    const seKeys = Object.keys(se).sort();
    expect(noKeys).toEqual(daKeys);
    expect(seKeys).toEqual(daKeys);
  });

  test("all locales have same ui keys", () => {
    const da = getTranslations("da");
    const no = getTranslations("no");
    const se = getTranslations("se");
    const daKeys = Object.keys(da.ui).sort();
    const noKeys = Object.keys(no.ui).sort();
    const seKeys = Object.keys(se.ui).sort();
    expect(noKeys).toEqual(daKeys);
    expect(seKeys).toEqual(daKeys);
  });

  test("footer copy does not promise that no data is stored", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const aboutSite = getTranslations(locale).footer.aboutSite;
      expect(aboutSite, locale).not.toMatch(
        /gemmer ingen data|lagrer ingen data|sparar ingen data/i,
      );
      expect(aboutSite, locale).toMatch(/database|databas/i);
    }
  });

  test("all locales have localized search and OpenGraph copy", () => {
    expect(t("da", "ui.searchPlaceholder")).toBe("Søg blandt alle beregnere...");
    expect(t("no", "ui.searchPlaceholder")).toBe("Søk blant alle kalkulatorer...");
    expect(t("se", "ui.searchPlaceholder")).toBe("Sök bland alla kalkylatorer...");
    expect(t("da", "site.ogTagline")).toContain("danskere");
    expect(t("no", "site.ogTagline")).toContain("nordmenn");
    expect(t("se", "site.ogTagline")).toContain("svenskar");
  });
});

describe("t", () => {
  test("resolves nested path", () => {
    expect(t("da", "site.name")).toBe("MinBeregner.dk");
    expect(t("se", "site.name")).toBe("Beräknare.se");
    expect(t("no", "site.name")).toBe("Beregner.no");
  });

  test("resolves deep path", () => {
    expect(t("da", "nav.categories.economy")).toBe("Økonomi");
    expect(t("se", "nav.categories.economy")).toBe("Ekonomi");
  });

  test("returns path string for missing key", () => {
    expect(t("da", "does.not.exist")).toBe("does.not.exist");
  });

  test("returns path string for partial path hitting non-object", () => {
    expect(t("da", "site.name.deeper")).toBe("site.name.deeper");
  });

  test("returns path for non-string leaf", () => {
    expect(t("da", "nav.categories")).toBe("nav.categories");
  });
});
