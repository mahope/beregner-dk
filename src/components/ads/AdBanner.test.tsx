import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Home from "@/app/page";
import BMIPage from "@/app/bmi/page";
import TidsberegnerPage from "@/app/tidsberegner/page";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import * as ads from "@/lib/ads";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import type { Locale } from "@/lib/i18n";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

const consentKey = "mb_cookie_consent_v2";
const getScript = () =>
  document.querySelector<HTMLScriptElement>('script[src*="pagead2.googlesyndication.com"]');

async function renderPage(Page: typeof TidsberegnerPage, locale: Locale = "da") {
  const domainConfig = getDomainConfigByLocale(locale);
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(domainConfig);
  const page = await Page();
  const footer = await Footer();

  await act(async () => {
    render(
      <LocaleProvider locale={locale} domainConfig={domainConfig}>
        {page}
        {footer}
        <CookieConsent />
      </LocaleProvider>,
    );
  });
}

function storeConsent(accepted: boolean, version = 2) {
  localStorage.setItem(consentKey, JSON.stringify({ date: Date.now(), accepted, version }));
}

function expectNoAds() {
  expect(screen.queryByText("Annonce", { exact: true, selector: "p" })).not.toBeInTheDocument();
  expect(document.querySelector("[data-ad-slot]")).toBeNull();
  expect(getScript()).toBeNull();
}

beforeEach(() => {
  vi.spyOn(ads, "reloadAfterAdConsentWithdrawal").mockImplementation(() => {});
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "1");
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_RESULT", "1234567890");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.removeItem(consentKey);
  fireEvent(window, new StorageEvent("storage", { key: consentKey }));
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

test.each([["forsiden", Home], ["/bmi", BMIPage]] as const)(
  "%s har ingen annoncer med aktiveret flag og samtykke",
  async (_route, Page) => {
    storeConsent(true);
    await renderPage(Page);
    expectNoAds();
  },
);

test("en udvalgt side viser først annoncen, når brugeren accepterer i banneret", async () => {
  await renderPage(TidsberegnerPage);
  expectNoAds();

  fireEvent.click(screen.getByRole("button", { name: "Accepter" }));

  expect(screen.getByText("Annonce", { exact: true })).toBeInTheDocument();
  const ads = document.querySelectorAll('[data-ad-slot="1234567890"]');
  expect(ads).toHaveLength(1);
  expect(ads[0]).not.toHaveAttribute("data-ad-format", "auto");
  expect(getScript()).not.toBeNull();
});

test("banner og annonce følger accept og afslag fra en anden fane", async () => {
  await renderPage(TidsberegnerPage);
  expect(screen.getByRole("button", { name: "Accepter" })).toBeInTheDocument();
  expectNoAds();

  storeConsent(true);
  fireEvent(window, new StorageEvent("storage", { key: consentKey }));

  expect(screen.getByText("Annonce", { exact: true })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Accepter" })).not.toBeInTheDocument();

  storeConsent(false);
  fireEvent(window, new StorageEvent("storage", { key: consentKey }));

  expectNoAds();
  expect(screen.queryByRole("button", { name: "Accepter" })).not.toBeInTheDocument();

  localStorage.removeItem(consentKey);
  fireEvent(window, new StorageEvent("storage", { key: consentKey }));

  expect(screen.getByRole("button", { name: "Accepter" })).toBeInTheDocument();
});

test("afvisning i banneret indlæser intet", async () => {
  await renderPage(TidsberegnerPage);
  fireEvent.click(screen.getByRole("button", { name: "Afvis" }));
  expectNoAds();
});

test("et tidligere afslag indlæser intet", async () => {
  storeConsent(false, 1);
  await renderPage(TidsberegnerPage);
  expectNoAds();
  expect(screen.queryByRole("button", { name: "Accepter" })).not.toBeInTheDocument();
});

test.each([
  { accepted: true },
  { accepted: true, version: 2 },
  { accepted: false },
])("gammelt samtykke på v1-nøglen åbner banneret uden annoncer (%j)", async (consent) => {
  localStorage.setItem("mb_cookie_consent_v1", JSON.stringify(consent));
  await renderPage(TidsberegnerPage);
  expectNoAds();
  expect(screen.getByRole("button", { name: "Accepter" })).toBeInTheDocument();
});

test.each([
  ["0", "1234567890"],
  [undefined, "1234567890"],
  ["true", undefined],
  ["true", "footer"],
])("en udvalgt side kræver gyldigt flag %s og slot %s", async (flag, slot) => {
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", flag);
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_RESULT", slot);
  storeConsent(true);
  await renderPage(TidsberegnerPage);
  expectNoAds();
});

test.each([
  ["se", "Webbplatsen använder inga kakor.", "Acceptera"],
  ["no", "Nettstedet bruker ingen informasjonskapsler.", "Godta"],
] as const)("locale %s beskriver det cookiefrie site og viser ingen annoncer efter accept", async (locale, body, accept) => {
  await renderPage(TidsberegnerPage, locale);
  expect(screen.getByText(body, { exact: false })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: accept }));

  expect(screen.queryByRole("button", { name: accept })).not.toBeInTheDocument();
  expectNoAds();
});

test.each([
  ["da", "Cookieindstillinger", "Accepter", "Afvis"],
  ["se", "Cookieinställningar", "Acceptera", "Avvisa"],
] as const)("locale %s kan ændre det gemte valg fra footeren med flaget fra", async (locale, settings, accept, decline) => {
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "0");
  await renderPage(TidsberegnerPage, locale);
  expectNoAds();

  fireEvent.click(screen.getByRole("button", { name: accept }));
  expect(JSON.parse(localStorage.getItem(consentKey) ?? "null")).toMatchObject({ accepted: true, version: 2 });
  expectNoAds();

  const trigger = within(screen.getByRole("contentinfo")).getByRole("button", { name: settings });
  expect(trigger.closest("footer")).not.toBeNull();
  fireEvent.click(trigger);
  expect(screen.getByRole("button", { name: decline })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: decline }));
  expect(JSON.parse(localStorage.getItem(consentKey) ?? "null")).toMatchObject({ accepted: false, version: 2 });
  expect(trigger).toHaveFocus();
  expectNoAds();

  cleanup();
  await renderPage(TidsberegnerPage, locale);
  expect(screen.queryByRole("button", { name: accept })).not.toBeInTheDocument();
  fireEvent.click(within(screen.getByRole("contentinfo")).getByRole("button", { name: settings }));
  fireEvent.click(screen.getByRole("button", { name: accept }));
  expect(JSON.parse(localStorage.getItem(consentKey) ?? "null")).toMatchObject({ accepted: true, version: 2 });
  expectNoAds();
  expect(ads.reloadAfterAdConsentWithdrawal).not.toHaveBeenCalled();
});

test("afslag fra cookieindstillingerne fjerner annonce og annoncescript", async () => {
  storeConsent(true);
  await renderPage(TidsberegnerPage);
  expect(getScript()).not.toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Cookieindstillinger" }));
  fireEvent.click(screen.getByRole("button", { name: "Afvis" }));

  expectNoAds();
  expect(ads.reloadAfterAdConsentWithdrawal).toHaveBeenCalledOnce();
});

test("gemt samtykke bruger ikke-personaliserede annoncer og genbruger Google-scriptet", async () => {
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "true");
  storeConsent(true);
  await renderPage(TidsberegnerPage);

  const script = getScript();
  if (!script) throw new Error("Annoncescriptet mangler");
  expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  const push = vi.fn(() => window.adsbygoogle?.requestNonPersonalizedAds);
  window.adsbygoogle = { push };
  fireEvent.load(script);
  expect(push).toHaveBeenCalledTimes(1);

  cleanup();
  await renderPage(BMIPage);
  expectNoAds();
  expect(push).toHaveBeenCalledTimes(1);

  cleanup();
  await renderPage(TidsberegnerPage);
  expect(screen.getByText("Annonce", { exact: true })).toBeInTheDocument();
  expect(getScript()).toBeNull();
  expect(push).toHaveBeenCalledTimes(2);
  expect(push.mock.results.map(({ value }) => value)).toEqual([1, 1]);

  cleanup();
  await renderPage(BMIPage);
  storeConsent(false);
  fireEvent(window, new StorageEvent("storage", { key: consentKey }));

  expect(ads.reloadAfterAdConsentWithdrawal).toHaveBeenCalledOnce();
  expectNoAds();
});
