/**
 * Alders-tabellen på /alder — især dens sidste sætning.
 *
 * Teksten lovede "hver række er den, der fylder alderen i dag", men den 29.
 * februar regnes tabellen fra 28. februar, fordi 18 af 26 rækker ellers
 * forsvinder. Så modsagde brødteksten tabellen én dag hvert fjerde år. Klokken
 * låses derfor, så porten fejler på de to dage, hvor teksten skal være
 * henholdsvis «i dag» og «28. februar 2024».
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import AlderDageVedAlder from "./AlderDageVedAlder";
import { LocaleProvider } from "./LocaleProvider";

const domainConfig = getDomainConfig("localhost");

function renderMed(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <AlderDageVedAlder locale={locale} />
    </LocaleProvider>
  );
}

describe("AlderDageVedAlder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("en helt almindelig dag lover rækkerne for i dag", () => {
    vi.setSystemTime(new Date("2026-10-03T12:00:00"));
    renderMed("da");

    expect(
      screen.getByText(/Hver række er den, der fylder alderen i dag/)
    ).toBeInTheDocument();
  });

  test("den 29. februar skriver den dag, tabellen faktisk er regnet fra", () => {
    vi.setSystemTime(new Date("2024-02-29T12:00:00"));
    renderMed("da");

    // Før rettelsen stod her "i dag", mens alle 26 tal var fra 28. februar.
    expect(screen.queryByText(/Hver række er den, der fylder alderen i dag/)).toBeNull();
    expect(
      screen.getByText(/Hver række er den, der fylder alderen 28\. februar 2024/)
    ).toBeInTheDocument();
    // Alle rækker er med, så tabellen ikke bare er blevet tømt.
    expect(screen.getAllByRole("row")).toHaveLength(28); // 2 tabeller + 2 headere + 26 rækker
  });

  test("den 29. februar på svensk", () => {
    vi.setSystemTime(new Date("2024-02-29T12:00:00"));
    renderMed("se");

    expect(
      screen.getByText(/Varje rad är den som fyller åldern 28 februari 2024/)
    ).toBeInTheDocument();
  });
});