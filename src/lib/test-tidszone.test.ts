import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { stripKommentarer } from "./kommentar-scanner";

/**
 * Port på det ur en test regner sit forventningstal med.
 *
 * Siderne læser dagen med `iDagPaSiden` — i **sidens** tidszone, aldrig
 * serverens. `tilIsoDato(new Date())` læser derimod *serverens* tidszone, og
 * bygge- og kørserveren står i UTC. Mellem kl. 00:00 og 02:00 dansk tid er de
 * to ure uenige om dagen.
 *
 * Det er ikke en hypotese. CI kørte i UTC og blev rød 30/9 22:12 UTC på de to
 * tests i `alder/page.test.tsx`, der sammenlignede den renderede markup med et
 * tal regnet på serverens dag: siden sagde 13.349 dage (rigtigt for 1. oktober
 * i København), testen forventede 13.348 (rigtigt for 30. september i UTC).
 * Målt med `TZ=UTC npx vitest run`: 2 fejl i 1 fil, og de samme to som CI.
 * Lokalt var de grønne, fordi maskinen står i København — en test der kun kan
 * fejle på en andens tidszone, er en test der ikke holder.
 *
 * Så porten forbyder kaldet i testfiler, med en hvidliste der er *eksplicit*
 * frem for automatisk. En test må ikke få lov til at læse dagen med serverens
 * ur ved at være tilfældigt placeret i en mappe, men fordi nogen har skrevet
 * hvorfor. Hver undtagelse er en komponent, der kører i læserens egen browser,
 * hvor læsning af `Date`-objektets kalenderfelter er det *rigtige* ur —
 * serverens tidszone findes slet ikke i en browser.
 *
 * Hvidlisten tæller forekomster, ikke bare filer. Det er fordi `alder`'s test
 * skal *beholde* sit ene negative kald: det er påstanden om, at serverens dag
 * ikke står på siden. Uden tællingen ville porten være nødt til at give hele
 * filen frit lejde, og så kunne den nye fejl flytte ind i den samme fil,
 * lige hvor den gjorde mest skade.
 */
const TOLADT: { fil: string; nøjagtig: number; hvorfor: string }[] = [
  {
    fil: "src/components/DatoBeregner.test.tsx",
    nøjagtig: 1,
    hvorfor:
      "`DatoBeregner` er en klientkomponent, der bruger `tilIsoDato(new Date())` " +
      "i læserens browser. Testen skal derfor forvente præcis det tal komponenten " +
      "selv regner — serverens tidszone er ikke med i billedet.",
  },
  {
    fil: "src/components/standarddato.test.tsx",
    nøjagtig: 1,
    hvorfor:
      "Testen *beviser* med falsk tid, at `tilIsoDato` læser det lokale ur: den " +
      "sætter systemtiden til et tidspunkt, hvor UTC og dansk tid er på hver " +
      "sin dag, og kræver at de to funktioner giver hver sin dato. Det er hele " +
      "pointen med filen.",
  },
  {
    fil: "src/app/alder/page.test.tsx",
    nøjagtig: 1,
    hvorfor:
      "Testen har ét kald, og det er et *bevis mod* serverens ur: når de to ure " +
      "er uenige, kræver den at tallet fra serverens dag ikke står i markupken. " +
      "Fjernes påstanden, forsvinder undtagelsen med den.",
  },
  {
    fil: "src/lib/test-tidszone.test.ts",
    nøjagtig: 7,
    hvorfor:
      "Portens *egne* syntetiske eksempler — de er strenge, ikke kald. Antallet " +
      "er en fælde: en ny reel reference i denne fil giver et andet tal, og så " +
      "er undtagelsen død og porten kan ikke se den.",
  },
];

/** Kaldet, som læser dagen med serverens tidszone. */
const MONSTER = /tilIsoDato\(\s*new Date\(\s*\)\s*\)/;

function alleTestfiler(): string[] {
  const fund: string[] = [];
  const rod = resolve(__dirname, "..");
  const gaa = (mappe: string) => {
    for (const entry of readdirSync(mappe, { withFileTypes: true })) {
      const fuld = join(mappe, entry.name);
      if (entry.isDirectory()) gaa(fuld);
      else if (/\.test\.tsx?$/.test(entry.name)) fund.push(fuld);
    }
  };
  gaa(rod);
  return fund;
}

/** Linjenumre med `tilIsoDato(new Date())` i *koden* — altså uden kommentarer. */
function fundMedLinje(fil: string): number[] {
  const raa = readFileSync(fil, "utf8");
  const kode = stripKommentarer(raa);
  const linjer: number[] = [];
  kode.split("\n").forEach((linje, indeks) => {
    if (MONSTER.test(linje)) linjer.push(indeks + 1);
  });
  return linjer;
}

/** Samme form, men fund i hele filen på én gang. */
function antalI(hele: string): number {
  return hele.match(new RegExp(MONSTER.source, "g"))?.length ?? 0;
}

describe("port på det ur testene regner dagen med", () => {
  it("portens egen mønster rammer den form den skal fange", () => {
    // De fire skrivemåder af det samme kald. `new RegExp(MONSTER.source, "g")`
    // i stedet for et `g`-flag på MONSTER selv: en global regex har en
    // `lastIndex` der flytter sig, så en port der genbruger den, bliver grøn
    // fordi *den* glemmer at nulstille — grøn for den forkerte grund.
    for (const kode of [
      "const d = tilIsoDato(new Date());",
      "const d = tilIsoDato( new Date( ) );",
      "const d = tilIsoDato(new Date() );",
      "for (const x of y) { z = tilIsoDato(new Date()); }",
    ]) {
      expect(MONSTER.test(kode)).toBe(true);
    }

    // Og det den *ikke* må ramme: et kalenderfelt der er værd at teste, en
    // variabel der hedder noget andet, og sidens eget ur.
    for (const kode of [
      "expect(tilIsoDato(new Date(2026, 0, 15))).toBe('2026-01-15');",
      "const d = tilIsoDato(naadesDato);",
      "const d = iDagPaSiden(new Date(), locale);",
    ]) {
      expect(MONSTER.test(kode)).toBe(false);
    }
  });

  it("kommentarer er ikke kode, så portens egen forklaring ikke er et fund", () => {
    // Ellers kunne denne port aldrig forklare sig selv. Målt på hele `src/`
    // af `intl-locale-tag.test.ts`'s egen slagsing — samme scanner, samme fejl.
    const medForklaring = [
      "/**",
      " * Kalder `tilIsoDato(new Date())` giver serverens dag, ikke sidens.",
      " */",
      "const d = iDagPaSiden(new Date(), locale);",
    ].join("\n");

    expect(antalI(stripKommentarer(medForklaring))).toBe(0);
    expect(antalI(stripKommentarer("const d = tilIsoDato(new Date());"))).toBe(1);
  });

  it("ingen test må læse dagen med serverens ur", () => {
    const tilladt = new Map(TOLADT.map((t) => [t.fil, t.nøjagtig]));
    const fund: string[] = [];

    for (const fil of alleTestfiler()) {
      const relativ = relative(resolve(__dirname, "..", ".."), fil).split("\\").join("/");
      const fundet = fundMedLinje(fil);
      if (fundet.length === 0) continue;

      const tilladtAntal = tilladt.get(relativ);
      if (tilladtAntal === undefined) {
        fund.push(`${relativ}:${fundet.join(",")} (${fundet.length} forekomster)`);
        continue;
      }
      if (fundet.length !== tilladtAntal) {
        fund.push(
          `${relativ}: hvidlisten siger ${tilladtAntal}, der er ${fundet.length} ` +
            `på linje ${fundet.join(",")}`
        );
      }
    }

    expect(
      fund,
      "Disse tests læser dagen med serverens tidszone. Brug " +
        "`iDagPaSiden(new Date(), locale)` — eller skriv i hvidlisten ovenfor, " +
        "hvorfor koden under test kører i læserens browser."
    ).toEqual([]);
  });

  it("hver undtagelse er stadig nødvendig, og den siger hvorfor", () => {
    for (const { fil, nøjagtig, hvorfor } of TOLADT) {
      const fuld = resolve(__dirname, "..", "..", fil);
      const fundet = fundMedLinje(fuld);

      // En undtagelse der ikke længere svarer til noget, er en død undtagelse:
      // den skjuler ingenting nu og bliver en vane, når næste fejl skrives.
      expect(
        fundet.length,
        `${fil} står på hvidlisten, men har ${fundet.length} kald i stedet for ` +
          `${nøjagtig}. Ret den, eller fjern den fra TOLADT, så porten igen kan ` +
          `fange en ny fejl i filen.`
      ).toBe(nøjagtig);
      expect(
        hvorfor.length,
        `${fil}: en undtagelse uden en begrundelse er bare en bortsigtet regel.`
      ).toBeGreaterThan(60);
    }
  });
});
