import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { type Laangiver } from "@/lib/kredit-eksempler";
import { KreditEksempel } from "./KreditEksempel";

// Fixed data, so the test does not depend on which lenders currently have an example.
const bank: Laangiver = {
  navn: "Testbank",
  url: "https://testbank.example/billaan",
  tjekket: "2026-11-18",
  eksempel: {
    produkt: "Billån",
    samletKreditbeloeb: "100.000 kr.",
    loebetid: "5 år",
    paalydendeRente: "4,00 % (variabel)",
    debitorrente: "4,06 %",
    debitorrenteKilde: { navn: "Testbankens prisskilt", url: "https://testbank.example/prisskilt.pdf" },
    aop: "5,1 %",
    maanedligYdelse: "1.850 kr.",
    samledeKreditomkostninger: "11.000 kr.",
    samletTilbagebetaling: "111.000 kr.",
    kilde: "https://testbank.example/billaan",
    hentet: "2026-11-18",
  },
};

const udenEksempel: Laangiver = { navn: "Ingen Tal", url: "https://ingen.example/", tjekket: "2026-11-18", eksempel: null };

describe("KreditEksempel", () => {
  test("viser långiverens eksempel med debitorrente, kilde og dato", () => {
    const { container, getByRole } = render(<KreditEksempel laangiver={bank} />);
    const tekst = container.textContent ?? "";
    expect(tekst).toContain("pålydende rente 4,00 % (variabel), debitorrente 4,06 % (ifølge Testbankens prisskilt), ÅOP 5,1 %");
    expect(tekst).toContain("samlet tilbagebetaling 111.000 kr.");
    expect(tekst).toContain("Eksemplet er hentet fra Testbank den 18. november 2026.");
    expect(tekst).not.toContain("kr..");
    expect(getByRole("link", { name: "Testbank" }).getAttribute("href")).toBe("https://testbank.example/billaan");
    expect(getByRole("link", { name: "Testbankens prisskilt" }).getAttribute("href")).toBe(
      "https://testbank.example/prisskilt.pdf",
    );
  });

  test("viser kun debitorrenten, når eksemplet ikke har en pålydende rente", () => {
    const { paalydendeRente: _p, debitorrenteKilde: _k, ...rest } = bank.eksempel!;
    const { container } = render(<KreditEksempel laangiver={{ ...bank, eksempel: rest }} />);
    expect(container.textContent).toContain("løbetid 5 år, debitorrente 4,06 %, ÅOP 5,1 %");
    expect(container.textContent).not.toContain("pålydende");
  });

  test("viser intet, når långiveren ikke har et offentliggjort eksempel", () => {
    const { container } = render(<KreditEksempel laangiver={udenEksempel} />);
    expect(container.textContent).toBe("");
  });
});
