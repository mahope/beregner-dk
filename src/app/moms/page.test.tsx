import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import MomsPage from "./page";

vi.mock("@/components/MomsBeregner", () => ({
  default: () => <div>Momsværktøj</div>,
}));
vi.mock("@/components/AffiliateBox", () => ({
  SelvstaendigAffiliate: () => null,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: { question: string; answer: string }[] }) => (
    <ul>
      {items.map((item) => <li key={item.question}>{item.question} {item.answer}</li>)}
    </ul>
  ),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("moms page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Momsberegner",
      answer: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
      schema: "Gratis momsberegner. Beregn dansk moms på 25 % med priser inkl. og ekskl. moms.",
    },
    {
      locale: "se" as const,
      heading: "Momskalkylator",
      answer: "Beräkna svensk moms på 25 %, 12 % eller 6 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
      schema: "Gratis momskalkylator. Beräkna svensk moms på 25 %, 12 % och 6 % med priser inkl. och exkl. moms.",
    },
  ])("viser det konkrete svar, schema og beregneren i $locale", async ({ locale, heading, answer, schema }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await MomsPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(schema);
    expect(html).toContain("Momsværktøj");
  });

  test("viser formler for alle svenska momssatser i synlig FAQ", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    expect(html).toContain("1 000 kr × 1,25 = 1 250 kr, × 1,12 = 1 120 kr eller × 1,06 = 1 060 kr");
    expect(html).toContain("Momsandelen är cirka 20 % vid 25 % moms, 10,71 % vid 12 % och 5,66 % vid 6 %");
  });
});
