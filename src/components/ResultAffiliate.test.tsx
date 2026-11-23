import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";
import KalorieBeregner from "./KalorieBeregner";
import SolcelleBeregner from "./SolcelleBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { TRACKING_URLS } from "@/lib/adtraction";
import { generateShareableLink } from "@/lib/calculation-state";
import { trackAffiliateClick } from "@/lib/analytics";

vi.mock("next/navigation", () => ({ usePathname: () => window.location.pathname }));
vi.mock("@/lib/analytics", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/analytics")>(),
  trackAffiliateClick: vi.fn(),
}));
vi.mock("@/lib/adtraction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/adtraction")>();
  actual.TRACKING_URLS["1888641530"] = "https://tracking.example/t/t?a=2&as=2056156501&t=2";
  return actual;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

const cases = [
  { path: "/kalorier", name: "Lifesum", id: "1951492778", result: "Dagligt kaloriebehov", Component: KalorieBeregner },
  { path: "/solceller", name: "Solvari", id: "1888641530", result: "Din solcellebesparelse", Component: SolcelleBeregner },
] as const;

function vis(Component: (typeof cases)[number]["Component"], path: string, locale: "da" | "se" = "da") {
  window.history.replaceState({}, "", path);
  render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig(locale === "da" ? "minberegner.dk" : "beraknare.se")}>
      <Component />
    </LocaleProvider>,
  );
}

test.each(cases)("$name vises efter resultatet med annonce og kliksporing", ({ Component, path, name, result }) => {
  vis(Component, path);
  const annonce = screen.getByText("Annonce");
  const link = screen.getByRole<HTMLAnchorElement>("link", { name: new RegExp(name) });
  expect(annonce).toBeVisible();
  expect(screen.getByText(result).compareDocumentPosition(annonce) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(link.rel.split(" ")).toEqual(expect.arrayContaining(["sponsored", "nofollow", "noopener"]));
  const epi = `epi=mb.${path.slice(1)}.${name.toLowerCase()}`;
  const basis = name === "Lifesum"
    ? "https://ion.lifesum.com/t/t?a=1951492779&as=2056156501&t=2&tk=1"
    : "https://tracking.example/t/t?a=2&as=2056156501&t=2";
  const deeplink = name === "Solvari" ? `&url=${encodeURIComponent("https://www.solvari.dk/solceller")}` : "";
  expect(link.href).toBe(`${basis}&${epi}${deeplink}`);
  expect(trackAffiliateClick).not.toHaveBeenCalled();
  fireEvent.click(link);
  expect(trackAffiliateClick).toHaveBeenCalledExactlyOnceWith(expect.any(String), link.href);
});

test.each(cases)("$name vises kun på dansk", ({ Component, path, name }) => {
  vis(Component, path, "se");
  expect(screen.queryByRole("link", { name: new RegExp(name) })).not.toBeInTheDocument();
});

test.each(cases)("$name skjules uden registreret trackinglink", ({ Component, path, name, id }) => {
  const link = TRACKING_URLS[id];
  delete TRACKING_URLS[id];
  try {
    vis(Component, path);
    expect(screen.queryByRole("link", { name: new RegExp(name) })).not.toBeInTheDocument();
  } finally {
    if (link !== undefined) TRACKING_URLS[id] = link;
  }
});

test("Solvari forsvinder sammen med et ugyldigt solcelleresultat, og PVGIS er en redaktionel kilde", () => {
  vis(SolcelleBeregner, "/solceller");
  const kilde = screen.getByRole<HTMLAnchorElement>("link", { name: /PVGIS/ });
  expect(kilde).toHaveAttribute("rel", "noopener noreferrer");
  expect(new URL(kilde.href).searchParams.has("epi")).toBe(false);

  fireEvent.change(screen.getByRole("spinbutton", { name: /Årligt elforbrug/i }), { target: { value: "" } });
  expect(screen.queryByText("Din solcellebesparelse")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Solvari/ })).not.toBeInTheDocument();
});

test("Lifesum skjules ved en alder under 18 år", () => {
  vis(KalorieBeregner, "/kalorier");
  fireEvent.change(screen.getByRole("spinbutton", { name: /Alder/i }), { target: { value: "17" } });
  expect(screen.getByText("Dagligt kaloriebehov")).toBeVisible();
  expect(screen.queryByRole("link", { name: /Lifesum/ })).not.toBeInTheDocument();
});

test.each([17, 18])("Lifesum afventer delingslinkets alder (%i) efter første HTML", (alder) => {
  window.history.replaceState({}, "", "/kalorier");
  const { fullUrl } = generateShareableLink({
    type: "kalorier",
    inputs: { alder },
    timestamp: Date.now(),
  });
  window.history.replaceState({}, "", fullUrl);
  const calculator = (
    <LocaleProvider locale="da" domainConfig={getDomainConfig("minberegner.dk")}>
      <KalorieBeregner />
    </LocaleProvider>
  );

  const html = renderToString(calculator);
  expect(html).toContain("Dagligt kaloriebehov");
  expect(html).not.toContain("Lifesum");

  render(calculator);
  expect(screen.getByRole("spinbutton", { name: /Alder/i })).toHaveValue(alder);
  const link = screen.queryByRole("link", { name: /Lifesum/ });
  expect(Boolean(link)).toBe(alder >= 18);
});
