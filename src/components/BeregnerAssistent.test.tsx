import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import BeregnerAssistent from "./BeregnerAssistent";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getSearchContent } from "@/lib/search-content";

const childBmiGuide = getSearchContent("da")[0];

function renderAssistant(locale: "da" | "no" | "se" = "da") {
  return render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      <BeregnerAssistent />
    </LocaleProvider>
  );
}

function openAssistant() {
  fireEvent.click(screen.getByRole("button", { name: "Spørg om din økonomi" }));
  return screen.getByRole("textbox", { name: "Hvad vil du beregne?" });
}

describe("BeregnerAssistent", () => {
  afterEach(() => {
    cleanup();
  });

  test.each(["no", "se"] as const)("does not render outside Danish", (locale) => {
    const { container } = renderAssistant(locale);

    expect(container).toBeEmptyDOMElement();
  });

  test("routes a child BMI query to the guide", async () => {
    renderAssistant();
    const input = openAssistant();

    fireEvent.change(input, { target: { value: "BMI for mit barn" } });

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /BMI for børn/ })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", childBmiGuide.href);
  });

  test("keeps adult BMI queries on the adult calculator", async () => {
    renderAssistant();
    const input = openAssistant();

    fireEvent.change(input, { target: { value: "BMI for voksne" } });

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /BMI Beregner for voksne/ })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/bmi");
  });

  test("keeps the adult quick suggestion", async () => {
    renderAssistant();
    openAssistant();

    fireEvent.click(screen.getByRole("button", { name: "Hvad er mit BMI for voksne?" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /BMI Beregner for voksne/ })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/bmi");
  });

  test("keeps the no-match state for an unrelated query", () => {
    renderAssistant();
    const input = openAssistant();

    fireEvent.change(input, { target: { value: "xyzzy" } });

    expect(screen.getByText(/Ingen match/)).toBeInTheDocument();
  });
});
