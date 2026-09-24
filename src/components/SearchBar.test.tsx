import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchBar from "./SearchBar";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";

const placeholders = {
  da: "Søg blandt alle beregnere...",
  no: "Søk blant alle kalkulatorer...",
  se: "Sök bland alla kalkylatorer...",
} as const;

describe("SearchBar", () => {
  test.each(["da", "no", "se"] as const)(
    "uses accessible %s search text",
    (locale) => {
      render(
        <LocaleProvider
          locale={locale}
          domainConfig={getDomainConfigByLocale(locale)}
        >
          <SearchBar beregnere={[]} />
        </LocaleProvider>
      );

      const input = screen.getByRole("combobox", { name: placeholders[locale] });
      expect(input).toHaveAttribute("placeholder", placeholders[locale]);
    }
  );
});
