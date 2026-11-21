import { describe, expect, it } from "vitest";
import {
  MOMS_LANDE,
  landSvarSprogholdig,
  momsLand,
  momsSatsUdenraekke,
  satsUdenraekkeSvar,
  udenlandRaeekker,
} from "./moms-eu";
import { beregnMoms, momsFaktor } from "./moms";

const DA_FORMAT = {
  procent: (tal: number) => String(tal).replace(".", ","),
  pris: (tal: number) => `${String(tal).replace(".", ",")} kr.`,
};
const SE_FORMAT = {
  procent: (tal: number) => String(tal).replace(".", ","),
  pris: (tal: number) => `${String(tal).replace(".", ",")} kr`,
};

describe("moms-eu: tabellen er fuldstændig og siger sig selv", () => {
  it("har alle 27 EU-lande plus Norge, og ingen af dem to gange", () => {
    const eu = MOMS_LANDE.filter((land) => !land.ikkeEu);
    expect(eu).toHaveLength(27);
    expect(MOMS_LANDE.filter((land) => land.ikkeEu).map((l) => l.kode)).toEqual(["NO"]);
    expect(new Set(MOMS_LANDE.map((l) => l.kode)).size).toBe(MOMS_LANDE.length);
  });

  it("mangler intet EU-land", () => {
    // Hvert medlemsland i EU's egen tabel. Kun Norge (ikke EU) mangler, og den
    // er med i modulet. Uden denne liste ville en landefejl bare se ud som
    // "et land der ikke kom med".
    const forventede = [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "EL", "HU", "IE", "IT",
      "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "DE",
    ].sort();
    const faktiske = MOMS_LANDE.filter((l) => !l.ikkeEu).map((l) => l.kode).sort();
    expect(faktiske).toEqual(forventede);
  });

  it("giver hvert land både et dansk og et svensk navn, og de to er ikke ens for de land der hedder forskelligt", () => {
    for (const land of MOMS_LANDE) {
      expect(land.navn.da.length).toBeGreaterThan(2);
      expect(land.navn.se.length).toBeGreaterThan(2);
    }
    expect(momsLand("NL").navn.da).toBe("Holland");
    expect(momsLand("NL").navn.se).toBe("Nederländerna");
    expect(momsLand("AT").navn.da).toBe("Østrig");
    expect(momsLand("AT").navn.se).toBe("Österrike");
    expect(momsLand("EL").navn.da).toBe("Grækenland");
    expect(momsLand("EL").navn.se).toBe("Grekland");
  });

  it("har en gyldig sats i hvert land", () => {
    for (const land of MOMS_LANDE) {
      expect(land.standard).toBeGreaterThan(0);
      expect(land.standard).toBeLessThanOrEqual(30);
      if (land.reduceret !== null) {
        expect(land.reduceret).toBeGreaterThan(0);
        expect(land.reduceret).toBeLessThan(land.standard);
      }
    }
  });

  it("kender kun Danmark og Sverige til 25 % standard blandt EU-landerne", () => {
    const med25 = MOMS_LANDE.filter((l) => l.standard === 25);
    expect(med25.map((l) => l.kode).sort()).toEqual(["DK", "HR", "NO", "SE"]);
    // Danmark har ingen reducerede sats. Sverige har 6 %, og det er den
    // adskillelse brødteksten gør sig på.
    expect(momsLand("DK").reduceret).toBeNull();
    expect(momsLand("SE").reduceret).toBe(6);
  });

  it("laever moms.ts uændret, så tabellen ikke kan modsige værktøjet", () => {
    // moms.ts er det ene sted, satsen til værktøjet ligger. Tabelstandarden for
    // Danmark skal derfor give præcis den faktor, værktøjet bruger.
    expect(momsFaktor(momsLand("DK").standard)).toBe(1.25);
    expect(momsFaktor(momsLand("SE").standard)).toBe(1.25);
    // Og beregnMoms med tabellens sats skal give det samme som med konstanten.
    expect(beregnMoms(1000, "tillaegMoms", momsLand("DK").standard).prisInklMoms).toBe(1250);
  });
});

describe("moms-eu: ingen pris står hårdkodet to steder", () => {
  it("regner hver 100-kr-celle gennem beregnMoms, samme regnestykke som værktøjet", () => {
    for (const raekke of udenlandRaeekker()) {
      const forventet = beregnMoms(100, "tillaegMoms", raekke.land.standard);
      expect(raekke.prisInklMoms100).toBe(forventet.prisInklMoms);
      expect(raekke.sats).toBe(raekke.land.standard);
    }
  });

  it("regner den modsatte retning med samme modul", () => {
    for (const raekke of udenlandRaeekker()) {
      const forventet = beregnMoms(100, "fratraekMoms", raekke.land.standard);
      expect(raekke.prisUdenMoms100).toBe(forventet.prisUdenMoms);
    }
  });

  it("giver 100 kr. → 125 kr. i Danmark og Sverige, 119 kr. i Tyskland og 127 kr. i Ungarn", () => {
    const pris = (kode: string) =>
      udenlandRaeekker().find((r) => r.land.kode === kode)!.prisInklMoms100;
    expect(pris("DK")).toBe(125);
    expect(pris("SE")).toBe(125);
    expect(pris("DE")).toBe(119);
    expect(pris("HU")).toBe(127);
    expect(pris("LU")).toBe(117);
  });

  it("har én række pr. land, i samme rækkefølge som modulet", () => {
    const raekker = udenlandRaeekker();
    expect(raekker).toHaveLength(MOMS_LANDE.length);
    expect(raekker.map((r) => r.land.kode)).toEqual(MOMS_LANDE.map((l) => l.kode));
  });
});

describe("moms-eu: laveste og højeste sats er fundet, ikke skrevet", () => {
  it("finder Luxembourg og Ungarn — de to brødteksten navngiver i dag", () => {
    const { lavest, hoejest } = momsSatsUdenraekke();
    expect(lavest.kode).toBe("LU");
    expect(lavest.standard).toBe(17);
    expect(hoejest.kode).toBe("HU");
    expect(hoejest.standard).toBe(27);
  });

  it("gør brødteksten og tabellen umulige at have forskellige syn på", () => {
    const { lavest, hoejest } = momsSatsUdenraekke();
    const rækker = udenlandRaeekker();
    const lavestPris = rækker.find((r) => r.land.kode === lavest.kode)!.prisInklMoms100;
    const hoejestPris = rækker.find((r) => r.land.kode === hoejest.kode)!.prisInklMoms100;
    // Hvis de to tal i brødteksten er rigtige, skal priserne også være det.
    expect(lavestPris).toBe(100 * momsFaktor(lavest.standard));
    expect(hoejestPris).toBe(100 * momsFaktor(hoejest.standard));
  });
});

describe("moms-eu: FAQ-svarene læser tabellen, ikke en gentaget streng", () => {
  it("svarer på de fire målte DA-søgninger med landets egen sats", () => {
    for (const kode of ["DE", "NL", "NO"]) {
      const svar = landSvarSprogholdig(kode, "da", DA_FORMAT);
      const land = momsLand(kode);
      expect(svar).toContain(`${land.navn.da}`);
      expect(svar).toContain(`${String(land.standard).replace(".", ",")} %`);
      // Prisen i svaret er den samme som tabellens celle.
      const pris = udenlandRaeekker().find((r) => r.land.kode === kode)!.prisInklMoms100;
      expect(svar).toContain(String(pris).replace(".", ",") + " kr.");
    }
  });

  it("svarer på de fire målte SE-søgninger med landets egen sats", () => {
    for (const kode of ["DE", "NL", "NO"]) {
      const svar = landSvarSprogholdig(kode, "se", SE_FORMAT);
      const land = momsLand(kode);
      expect(svar).toContain(`${land.navn.se}`);
      expect(svar).toContain(`${String(land.standard).replace(".", ",")} %`);
    }
  });

  it("siger det eksplicit at Norge ikke er i EU, på begge sprog", () => {
    expect(landSvarSprogholdig("NO", "da", DA_FORMAT)).toContain("ikke medlem af EU");
    expect(landSvarSprogholdig("NO", "se", SE_FORMAT)).toContain("ingår inte i EU");
    // Og de 27 EU-lande siger det ikke.
    expect(landSvarSprogholdig("DE", "da", DA_FORMAT)).not.toContain("ikke medlem af EU");
    expect(landSvarSprogholdig("DE", "se", SE_FORMAT)).not.toContain("ingår inte i EU");
  });

  it("siger at Danmark ingen reducerede sats har, og at Sverige har", () => {
    expect(landSvarSprogholdig("DK", "da", DA_FORMAT)).toContain("ingen reducerede satser");
    expect(landSvarSprogholdig("DK", "se", SE_FORMAT)).toContain("inga reducerade satser");
    expect(landSvarSprogholdig("SE", "da", DA_FORMAT)).toContain("en reduceret sats på 6 %");
    expect(landSvarSprogholdig("SE", "se", SE_FORMAT)).toContain("en reducerad sats på 6 %");
  });

  it("læser laveste og højeste sats i spørgsmålet om EU's udvalg", () => {
    const da = satsUdenraekkeSvar("da", DA_FORMAT);
    expect(da).toContain("17 % i Luxembourg");
    expect(da).toContain("27 % i Ungarn");
    const se = satsUdenraekkeSvar("se", SE_FORMAT);
    expect(se).toContain("17 % i Luxemburg");
    expect(se).toContain("27 % i Ungern");
  });

  it("laeser 117 kr. og 127 kr. i svaret, saa tallene kommer fra tabellen", () => {
    expect(satsUdenraekkeSvar("da", DA_FORMAT)).toContain("117 kr.");
    expect(satsUdenraekkeSvar("da", DA_FORMAT)).toContain("127 kr.");
    expect(satsUdenraekkeSvar("se", SE_FORMAT)).toContain("117 kr");
    expect(satsUdenraekkeSvar("se", SE_FORMAT)).toContain("127 kr");
  });

  it("kaster ved et ukendt land, så en skrivefejl ikke giver en tom streng", () => {
    expect(() => momsLand("XX")).toThrow(/Ukendt momssatsland/);
  });
});
