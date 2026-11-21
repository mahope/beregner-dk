/**
 * DageTilTimer er den eneste del af dage-til-siderne, der regner på den
 * besøgendes eget ur. Porten holder den til løftet: timetallet skal svare på
 * «hvor mange timer er der til <datoen>», det skal kunne skifte mellem
 * ental/flertal på dansk og svensk, og det må ikke stå i den server-tegnede
 * HTML — et froget tal der ville være forkert inden for den første time.
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import DageTilTimer from "./DageTilTimer";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

afterEach(cleanup);

/**
 * Mål-datoen, som serveren bygger den: UTC-midnat på kalenderdagen.
 * 2026-12-25 er 76 dage efter testens reference-dato.
 */
const JULEAFTEN = new Date("2026-12-25T00:00:00Z");

function setKlokken(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("DageTilTimer", () => {
  test("svarer på «hvor mange timer er der til juledagen» på dansk", () => {
    // To timer og tredive minutter frem, målt fra datoens lokale midnat.
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 21, 30).toISOString());
    render(<DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />);
    expect(
      screen.getByText("Det er 2 timer og 30 minutter til juledagen.")
    ).toBeInTheDocument();
  });

  test("bruger ental på dansk: time og minut", () => {
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 22, 59).toISOString());
    render(<DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />);
    expect(
      screen.getByText("Det er 1 time og 1 minut til juledagen.")
    ).toBeInTheDocument();
  });

  test("svarer på svensk med timmar och minuter", () => {
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 21, 30).toISOString());
    render(<DageTilTimer targetDate={JULEAFTEN} short="juldagen" locale="se" />);
    expect(
      screen.getByText("Det är 2 timmar och 30 minuter till juldagen.")
    ).toBeInTheDocument();
  });

  test("skifter til 0 timer og 0 minutter når datoen inde er", () => {
    setKlokken(
      new Date(JULEAFTEN.getUTCFullYear(), 11, 25, 0, 0, 1).toISOString()
    );
    render(<DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />);
    expect(
      screen.getByText("Det er 0 timer og 0 minutter til juledagen.")
    ).toBeInTheDocument();
  });

  test("rendes ikke i server-HTL'en, så der aldrig leveres et froget tal", () => {
    // Timetallet skifter hvert minut, så det må ikke stå i den HTML serveren
    // tegner: en besøgende en time senere ville have læst et tal, der allerede
    // var forkert. Effekter kører ikke under `renderToString`, så her må der
    // ikke komme noget tal ud.
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 21, 30).toISOString());
    const html = renderToString(
      <DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />
    );
    expect(html).toBe("");
  });

  test("opdaterer sig selv efter et halvt minut", () => {
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 21, 30).toISOString());
    render(<DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />);
    expect(
      screen.getByText("Det er 2 timer og 30 minutter til juledagen.")
    ).toBeInTheDocument();

    act(() => {
      vi.setSystemTime(
        new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 22, 0).getTime() + 30_000
      );
      vi.advanceTimersByTime(30_000);
    });
    expect(
      screen.getByText("Det er 1 time og 59 minutter til juledagen.")
    ).toBeInTheDocument();
  });

  test("holder op med at tælle ned, når komponenten forlader siden", () => {
    setKlokken(new Date(JULEAFTEN.getUTCFullYear(), 11, 24, 21, 30).toISOString());
    const { unmount } = render(
      <DageTilTimer targetDate={JULEAFTEN} short="juledagen" locale="da" />
    );
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
