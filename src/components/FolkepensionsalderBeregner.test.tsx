/**
 * Folkepensionsalder-værktøjet på /pension.
 *
 * Siden havde en tabel over folkepensionsalderen pr. fødselsår, men intet der
 * svarede på læserens eget spørgsmål. Porten dømmer den *daterede* halvdel af
 * svaret — fordi "65 ½ år" uden en dato er det, tabellen allerede gav, og fordi
 * en dato der ikke findes (29. februar 2020) ville være værre end ingen dato.
 *
 * Værktøjet er dansk, fordi `alderSkala` er dansk lov — derfor ingen svensk
 * test her.
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import FolkepensionsalderBeregner from "./FolkepensionsalderBeregner";

function renderVærktøjet() {
  return render(<FolkepensionsalderBeregner />);
}

function indtast(iso: string) {
  fireEvent.change(screen.getByLabelText("Fødselsdato"), {
    target: { value: iso },
  });
}

describe("FolkepensionsalderBeregner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("spørger om fødselsdatoen, før den siger noget om alderen", () => {
    renderVærktøjet();

    expect(screen.getByLabelText("Fødselsdato")).toBeInTheDocument();
    expect(
      screen.getByText(/Indtast din fødselsdato for at se, hvornår du kan gå på folkepension/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/folkepensionsalder er/)).not.toBeInTheDocument();
  });

  test("regner alder, dato og tid til pension for en født 1990", () => {
    renderVærktøjet();
    indtast("1990-03-15");

    // 1990 er efter 1971 i skalaen, så alderen er 70 år.
    expect(screen.getByText("70 år")).toBeInTheDocument();
    expect(screen.getByText("15. marts 2060")).toBeInTheDocument();
    expect(screen.getByText("15. september 2059")).toBeInTheDocument();
    expect(screen.getByText("Det er 33 år, 5 måneder og 11 dage.")).toBeInTheDocument();
  });

  test("regner den halve alder som seks måneder frem", () => {
    renderVærktøjet();
    indtast("1954-08-01");

    expect(screen.getByText("65 ½ år")).toBeInTheDocument();
    expect(screen.getByText("1. februar 2020")).toBeInTheDocument();
    expect(screen.getByText("1. august 2019")).toBeInTheDocument();
  });

  test("lægger en fødselsdag på månedens sidste dag", () => {
    renderVærktøjet();
    indtast("1954-08-31");

    // 31. august plus 65½ år er 29. februar 2020, fordi 2020 er et skudår.
    expect(screen.getByText("29. februar 2020")).toBeInTheDocument();
  });

  test("siger at tiden er ovre, når alderdatoen er passeret", () => {
    renderVærktøjet();
    indtast("1956-06-01");

    expect(screen.getByText(/Du kan gå på folkepension nu/)).toBeInTheDocument();
    expect(screen.queryByText(/^Det er /)).not.toBeInTheDocument();
  });
});