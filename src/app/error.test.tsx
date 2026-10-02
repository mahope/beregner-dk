import * as Sentry from "@sentry/nextjs";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import ErrorPage from "./error";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const LOCALES = ["da", "se", "no"] as const;

/** Rod-layoutets `LocaleProvider`, som den læser domænet på serveren og lægger om. */
function medLocale(locale: Locale, children: React.ReactNode) {
  return (
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      {children}
    </LocaleProvider>
  );
}

describe("root error page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("renders Danish fallback text without LocaleProvider", async () => {
    const error = new Error("boom");

    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Noget gik galt" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Der opstod en uventet fejl. Prøv at genindlæse siden.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prøv igen" })).toBeInTheDocument();
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledWith(error));
  });

  // Punkt 11 på en fejlside: sproget er en egenskab ved domænet, ikke ved
  // browseren. Før 2/10 læste `error.tsx` domænet i en `useEffect`, så første
  // render — og altså hele den server-renderede HTML — altid var dansk, også på
  // beraknare.se og beregnerno. Den eneste test renderer på `localhost`, hvis
  // fallback er `da`, så den nye sprog-gren var aldrig dømt.
  test("alle tre domæner får deres eget sprog i første render", () => {
    for (const locale of LOCALES) {
      const { unmount } = render(
        medLocale(locale, <ErrorPage error={new Error("boom")} reset={vi.fn()} />)
      );

      expect(
        screen.getByRole("heading", { name: t(locale, "ui.error") })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: t(locale, "ui.tryAgain") })
      ).toBeInTheDocument();
      // Ingen dansk på de to andre domæner — det var den danske flash.
      if (locale !== "da") {
        expect(screen.queryByText("Noget gik galt")).not.toBeInTheDocument();
        expect(screen.queryByText("Prøv igen")).not.toBeInTheDocument();
      }
      unmount();
    }
  });

  test("sproget er rigtigt i server-HTML, før nogen effekt har kørt", async () => {
    // `renderToStaticMarkup` kører slet ingen effekt, så den kan kun se den
    // første render — altså den, Google og alle uden JavaScript får.
    const { renderToStaticMarkup } = await import("react-dom/server");

    for (const locale of ["se", "no"] as const) {
      const html = renderToStaticMarkup(
        medLocale(locale, <ErrorPage error={new Error("boom")} reset={vi.fn()} />)
      );

      expect(html).toContain(t(locale, "ui.error"));
      expect(html).not.toContain("Noget gik galt");
    }
  });
});
