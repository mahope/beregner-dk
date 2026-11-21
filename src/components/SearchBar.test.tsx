import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SearchBar from "./SearchBar";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getSearchContent } from "@/lib/search-content";

const placeholders = {
  da: "Søg blandt alle beregnere...",
  no: "Søk blant alle kalkulatorer...",
  se: "Sök bland alla kalkylatorer...",
} as const;

const adultBmi = {
  title: "BMI Beregner for voksne",
  description: "Beregn BMI for voksne",
  href: "/bmi",
  category: "Sundhed",
};

const childBmiGuide = getSearchContent("da")[0];

function renderSearch() {
  return render(
    <LocaleProvider locale="da" domainConfig={getDomainConfigByLocale("da")}>
      <SearchBar beregnere={[adultBmi, childBmiGuide]} />
    </LocaleProvider>
  );
}

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
  });

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

  test("routes a child BMI query to the guide", () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: placeholders.da });

    fireEvent.change(input, { target: { value: "BMI for mit barn" } });

    const results = screen.getAllByRole("option");
    expect(results).toHaveLength(1);
    expect(results[0].querySelector("a")).toHaveAttribute("href", childBmiGuide.href);
  });

  test("keeps adult BMI queries on the adult calculator", () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: placeholders.da });

    fireEvent.change(input, { target: { value: "BMI for voksne" } });

    const results = screen.getAllByRole("option");
    expect(results[0].querySelector("a")).toHaveAttribute("href", adultBmi.href);
  });

  test("does not open an empty result list", () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: placeholders.da });

    fireEvent.change(input, { target: { value: "xyzzy" } });

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("supports keyboard selection and Escape", () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: placeholders.da });

    fireEvent.change(input, { target: { value: "BMI for mit barn" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", "search-result-0");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });
});
