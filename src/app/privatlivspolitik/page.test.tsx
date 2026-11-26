import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import CookiePolicy, { generateMetadata } from "@/app/cookiepolitik/page";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import PrivacyPolicy from "./page";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

test.each([
  ["da", "Cookieindstillinger"],
  ["se", "Cookieinställningar"],
] as const)("privatlivspolitikken på %s viser kun AdSense-afsnittet med flaget til", async (locale, settings) => {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "0");
  render(await PrivacyPolicy());
  expect(screen.queryByRole("heading", { name: "Google AdSense" })).not.toBeInTheDocument();

  cleanup();
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "1");
  render(await PrivacyPolicy());
  expect(screen.getByRole("heading", { name: "Google AdSense" })).toBeInTheDocument();
  expect(screen.getAllByText(settings, { selector: "strong" })[0]).toBeInTheDocument();
});

test("den danske cookiepolitik omtaler kun AdSense med flaget til", async () => {
  vi.mocked(getLocale).mockResolvedValue("da");
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "0");
  render(await CookiePolicy());
  expect(screen.queryByText(/Google AdSense/)).not.toBeInTheDocument();
  expect((await generateMetadata()).description).not.toContain("Google AdSense");

  cleanup();
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "1");
  render(await CookiePolicy());
  expect(screen.getByRole("heading", { name: /Google AdSense/ })).toBeInTheDocument();
  expect((await generateMetadata()).description).toContain("Google AdSense");
});

test("CVR-afsnittet (#cvr) vises kun på dansk med flaget til og linker til tilbagetrækning", async () => {
  vi.mocked(getLocale).mockResolvedValue("da");
  vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "0");
  render(await PrivacyPolicy());
  expect(screen.queryByRole("heading", { name: "CVR-nummer på momsberegneren" })).not.toBeInTheDocument();

  cleanup();
  vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "1");
  render(await PrivacyPolicy());
  expect(screen.getByRole("heading", { name: "CVR-nummer på momsberegneren" })).toHaveAttribute("id", "cvr");
  expect(screen.getByRole("link", { name: "Slet vores virksomheds netværk" })).toHaveAttribute(
    "href",
    "https://cvrradar.dk/slet-netvaerk",
  );
  // The analytics promise still stands next to the consent-based CVR field.
  expect(screen.getByText(/ingen IP-adresser, fingerprints eller device IDs/)).toBeInTheDocument();

  cleanup();
  vi.mocked(getLocale).mockResolvedValue("se");
  render(await PrivacyPolicy());
  expect(screen.queryByRole("heading", { name: "CVR-nummer på momsberegneren" })).not.toBeInTheDocument();
});
