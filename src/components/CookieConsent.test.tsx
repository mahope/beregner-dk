import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { readCookieConsent } from "@/lib/cookie-consent";
import CookieConsent, { CookieSettingsButton } from "./CookieConsent";
import { LocaleProvider } from "./LocaleProvider";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

test.each([
  ["da", "Cookieindstillinger", "Accepter", "Afvis"],
  ["se", "Cookieinställningar", "Acceptera", "Avvisa"],
] as const)("visitors on %s can save and change their cookie choice", (locale, settingsLabel, acceptLabel, declineLabel) => {
  const ui = (
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      <CookieConsent />
      <CookieSettingsButton label={settingsLabel} />
    </LocaleProvider>
  );
  const { unmount } = render(ui);
  fireEvent.click(screen.getByRole("button", { name: acceptLabel }));
  expect(readCookieConsent()?.accepted).toBe(true);
  unmount();

  render(ui);
  expect(screen.queryByRole("button", { name: acceptLabel })).not.toBeInTheDocument();
  const settings = screen.getByRole("button", { name: settingsLabel });
  fireEvent.click(settings);
  fireEvent.click(screen.getByRole("button", { name: declineLabel }));
  expect(readCookieConsent()?.accepted).toBe(false);
  expect(settings).toHaveFocus();
});
