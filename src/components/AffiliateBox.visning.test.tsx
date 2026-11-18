import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import type { Laangiver } from "@/lib/kredit-eksempler";
import { AffiliateBox } from "./AffiliateBox";
import { LocaleProvider } from "./LocaleProvider";

const udenEksempel: Laangiver = { navn: "Ingen Tal", url: "https://ingen.example/", tjekket: "2026-11-18", eksempel: null };

function vis(links: Parameters<typeof AffiliateBox>[0]["links"]) {
  return render(
    <LocaleProvider locale="da" domainConfig={getDomainConfigByLocale("da")}>
      <AffiliateBox title="Lån" links={links} credit />
    </LocaleProvider>,
  );
}

describe("AffiliateBox med kreditgiver", () => {
  test("viser kun navn og link, når långiveren ikke har et offentliggjort eksempel", () => {
    const { container, getByRole } = vis([
      { name: "Ingen Tal", description: "Salgstekst om lånet", url: "https://ingen.example/", cta: "Se lån", laangiver: udenEksempel },
    ]);
    expect(container.textContent).not.toContain("Salgstekst om lånet");
    expect(getByRole("link", { name: /Ingen Tal/ }).getAttribute("href")).toBe("https://ingen.example/");
  });

  test("viser beskrivelsen for partnere, der ikke er kreditgivere", () => {
    const { container } = vis([{ name: "Forsikring", description: "Få tilbud", url: "https://f.example/", cta: "Se" }]);
    expect(container.textContent).toContain("Få tilbud");
  });
});
