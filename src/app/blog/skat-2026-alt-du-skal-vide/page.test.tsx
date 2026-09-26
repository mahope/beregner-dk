import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { SATSER_2026, SKATTEFRADRAG_2026 } from "@/lib/satser-2026";
import Skat2026GuidePage, { generateMetadata } from "./page";

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const html = () => renderToStaticMarkup(Skat2026GuidePage());

describe("skat-2026 artiklen", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("titlen og H1 er svar-først med konkrete 2026-tal", async () => {
    const meta = await generateMetadata();

    expect(meta.title).toBe("Skat 2026: personfradrag 54.100 kr, bundskat 12,01 %");
    expect(html()).toContain(
      "Skat 2026: personfradrag 54.100 kr, bundskat 12,01 %",
    );
  });

  test("alle synlige satser kommer fra den centrale konfiguration", () => {
    const markup = html();

    expect(markup).toContain("54.100 kr"); // personfradrag
    expect(markup).toContain("25,049 %"); // kommuneskat, SVMN-gennemsnit
    expect(markup).toContain("0,639 %"); // kirkeskat, SVMN-gennemsnit
    expect(markup).toContain("12,75 %"); // beskæftigelsesfradrag
    expect(markup).toContain("63.300 kr"); // loft
    expect(markup).toContain("12.400 kr"); // håndværkerfradrag
    expect(markup).toContain("6.200 kr"); // servicefradrag
    expect(markup).toContain("3,17 kr./km");
    expect(markup).toContain("1,59 kr./km");
    expect(markup).toContain("uden loft"); // A-kasse
  });

  test("de fire dokumenterede fejl er væk", () => {
    const markup = html();

    // 1) kirkeskat var 0,88 % — den officielle 2026-gennemsats er 0,639 %
    expect(markup).not.toContain("0,88");
    // 2) håndværkerfradrag var 12.900 kr — loftet er 12.400 kr
    expect(markup).not.toContain("12.900");
    // 3) kommuneskat var "ca. 25,1 %" — gennemsnittet er 25,049 %
    expect(markup).not.toContain("25,1%");
    // 4) A-kasse blev fejlagtigt sat til 7.000 kr-loftet for fagforening
    expect(markup).not.toContain("op til 7.000 kr for A-kasse");
    // udokumenterede 2025-sammenligninger er fjernet
    expect(markup).not.toContain("51.600");
    expect(markup).not.toContain("200-500 kr");
  });

  test("regneeksemplet følger samme formel som løn-efter-skat-beregneren", () => {
    const markup = html();
    const aar = 480_000;
    const am = aar * SATSER_2026.amBidrag;
    const efterAm = aar - am;
    const beskaeftigelse = Math.min(
      efterAm * SATSER_2026.beskaeftigelsesfradragPct,
      SATSER_2026.beskaeftigelsesfradragMax,
    );
    const skattepligtig = efterAm - SATSER_2026.personfradrag - beskaeftigelse;
    const netto = aar - am - skattepligtig * (SATSER_2026.bundskat + SATSER_2026.kommuneskatSnit + SATSER_2026.kirkeskatSnit);

    expect(markup).toContain("Nettoudbetaling:");
    expect(markup).toContain(`${Math.round(netto / 12).toLocaleString("da-DK")} kr om`);
    // Trinnene skal faktisk summere til det samme som konklusionen
    expect(markup).not.toContain("26.000-27.000");
  });

  test("kilder og verificeringsdato er med, og fradragene linke til værktøjerne", () => {
    const markup = html();

    expect(markup).toContain("https://skat.dk/borger/om-skat/alle-satser-og-belob");
    expect(markup).toContain("https://www.skm.dk/aktuelt/tabeller-og-satser/");
    expect(markup).toContain("https://www.svmn.dk/");
    expect(markup).toContain(SKATTEFRADRAG_2026.sources.haandvaerkerfradrag);
    expect(markup).toContain(SKATTEFRADRAG_2026.verifiedAt);
    expect(markup).toContain('href="/skattefradrag"');
    expect(markup).toContain('href="/befordringsfradrag"');
    expect(markup).toContain('href="/rentefradrag"');
    expect(markup).toContain('href="/loen-efter-skat"');
  });
});
