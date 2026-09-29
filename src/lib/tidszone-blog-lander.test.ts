import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  klokkeslaetVed,
} from "./tidszone-reference";
import { blogVerdensAntal, blogVerdensRaekker } from "./tidszone-blog-lander";

const BLOG = "src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page.tsx";
const KOBLING = "src/lib/blog-kobling.ts";

function laes(relativ: string): string {
  return readFileSync(resolve(process.cwd(), relativ), "utf-8");
}

describe("blogindlæggets verdens-tabel", () => {
  test("dækker præcis TIDSZONER — ingen by mangler, ingen by er tilføjet", () => {
    // Dette er den egenskab, der gør at "16 byer" ikke kan overleve: er der
    // en by i TIDSZONER som tabellen ikke nævner, er vi tilbage ved C84's
    // fejl — to filer der fortæller hver sin historie om det samme tal.
    const iTabel = new Set(blogVerdensRaekker().map((r) => r.by));
    const iTidszoner = new Set(TIDSZONER.map((z) => z.by));

    const mangler = [...iTidszoner].filter((by) => !iTabel.has(by));
    const ekstra = [...iTabel].filter((by) => !iTidszoner.has(by));

    expect(mangler).toEqual([]);
    expect(ekstra).toEqual([]);
    // Låser sit eget omfang, så 0 fund ellers også er det resultat en
    // måler der ikke læser noget ville give (C176's lære).
    expect(TIDSZONER.length).toBeGreaterThanOrEqual(25);
  });

  test("titlen, <h1> og blog-koblingen læser antallet fra data, ikke fra en håndskrevet streng", () => {
    // Forsvaret mod afdriften der startede det hele: "16 byer" stod i den mest
    // indekserede streng på siden, mens artiklen selv viste 16 *rækker* — og
    // rækkerne var grupperede, så de dækkede 21 byer, mens TIDSZONER kendte
    // 25. Tre tal for ét spørgsmål.
    //
    // Låsen er på *formen*, ikke på tallet: ingen af de tre steder må
    // indeholde et håndskrevet by-tal, for et hårdkodet tal er præcis det,
    // der gjorde afdrift mulig. Min første version af denne test krævede
    // strengen "Tidsforskel for 25 byer" i kilden — den faldt, fordi
    // løsningen er at læse tallet fra data, og en test der kræver tallet i
    // kilden ville netop have tvunget det tilbage.
    const kilde = laes(BLOG);
    const kobling = laes(KOBLING);

    // Antallet er defineret ét sted og kommer fra modulet.
    expect(kilde).toContain("const VERDENS_ANTAL = blogVerdensAntal;");
    expect(blogVerdensAntal).toBe(TIDSZONER.length);

    // Begge overskrifter bruger variablen, ikke et tal.
    expect(kilde).toContain(
      "Hvad er klokken i USA? Tidsforskel for ${VERDENS_ANTAL} byer"
    );
    expect(kilde.match(/Tidsforskel for \$\{VERDENS_ANTAL\} byer/g)).toHaveLength(2);

    // Blog-koblingens beskrivelse er en håndskrevet streng i en anden fil,
    // så den kan ikke læse variablen. Den låses derfor på tallet — men
    // kun fordi den *kun* findes ét sted, så den kan ikke glide.
    expect(kobling).toContain(`tidsforskelen til ${blogVerdensAntal} byer`);

    // Det gamle tal må væk fra koden — også som en delstreng, så "116 byer"
    // ikke kan bestå låsen. Docblockens beskrivelse af den gamle værdi er
    // undtaget, for den skal kunne fortælle hvorfor rettelsen sker.
    expect(kilde.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/\b16 byer\b/);
    expect(kobling).not.toMatch(/\b16 byer\b/);
  });

  test("blog-koblingens beskrivelse nævner hverken flere eller færre byer end tabellen", () => {
    // Koblingen beskriver indlægget på beregnerens side. Den skal derfor
    // tælle det samme som indlægget — hvis den gjorde andet, ville læseren
    // få to forskellige svar om hvor mange byer artiklen dækker.
    const kobling = laes(KOBLING);
    const raekker = blogVerdensRaekker();
    const talt = kobling.match(/tidsforskelen til (\d+) byer/);
    expect(talt).not.toBeNull();
    expect(Number(talt?.[1])).toBe(raekker.length);
    expect(Number(talt?.[1])).toBe(blogVerdensAntal);
  });

  test("hver række har samme forskel som /tidszone's egen landetabel", () => {
    // Krydscheck mod `tidsskillnadRaekker`, altså mod den funktion
    // `/tidszone` selv renderer. Beregnet uafhængigt her af
    // `zone.utcVinter - DANSK_UTC_VINTER`, så en fejl i den ene måde at
    // regne på fanges her og ikke i `tidszone`'s egen visning.
    const raekker = blogVerdensRaekker();
    for (const raekke of raekker) {
      const zone = TIDSZONER.find((z) => z.by === raekke.by);
      expect(zone, `${raekke.by} skal findes i TIDSZONER`).toBeDefined();
      if (!zone) continue;
      const forventet = zone.utcVinter - DANSK_UTC_VINTER;
      expect(raekke.vinter, raekke.by).toBe(forventet);
      expect(raekke.tekstVinter, raekke.by).toBe(
        forventet === 0
          ? "Samme tid"
          : `${String(Math.abs(forventet)).replace(".", ",")} ${
              Math.abs(forventet) === 1 ? "time" : "timer"
            } ${forventet > 0 ? "frem" : "bagud"}`
      );
    }
  });

  test("kilde-byen står i kilden — aldrig dens egen overskrift", () => {
    // Blogtabellen siger "Kreta og Athen" og "Kina, Singapore og Bali" i én
    // række hver. Det er fire byer i to rækker, altså *fire færre* rækker end
    // byer. Titelens "N byer" skal derfor tælle byer, ikke rækker — og det er
    // præcis det, der gør den gamle "16 byer" til en fejl: 16 rækker var 21
    // byer, og slet ikke 25.
    const raekker = blogVerdensRaekker();
    expect(raekker.length).toBe(blogVerdensAntal);
  });

  test("brutaltiden kommer fra klokkeslaetVed, så kl. 14 ikke kan glide", () => {
    for (const raekke of blogVerdensRaekker()) {
      const zone = TIDSZONER.find((z) => z.by === raekke.by);
      if (!zone) continue;
      expect(raekke.kl14, raekke.by).toBe(klokkeslaetVed(14, zone, false));
    }
  });

  test("Phoenix er den eneste amerikanske by, der ikke flytter sig med Danmark", () => {
    // Den fælde, C172's stat-tabel allerede lærer: Phoenix er fast UTC-7,
    // mens Denver går fra 04 til 03, fordi Danmark flytter sig med. Uden
    // den her række ville bloggen gruppere Phoenix med resten af bjergbælterne
    // og være forkert i præcis de uger, hvor de to tal er forskellige.
    //
    // `sommer === undefined` betyder *byen skifter selv* — forskellen er da
    // den samme hele året. Min første version havde omvendt på det og
    // samlede de byer, der slet ikke bruger sommertid; fundet fordi testen
    // faldt med en liste, der så rigtig ud (Phoenix, Tokyo og Dubai er
    // netop de tre, der *ikke* flytter sig).
    const flytterMed = blogVerdensRaekker()
      .filter((r) => r.sommer === undefined)
      .map((r) => r.by);
    for (const by of ["Denver", "New York", "Chicago", "Los Angeles", "London"]) {
      expect(flytterMed, by).toContain(by);
    }
    expect(flytterMed).not.toContain("Phoenix");
    expect(flytterMed).not.toContain("Tokyo");
    expect(flytterMed).not.toContain("Dubai");

    const phoenix = blogVerdensRaekker().find((r) => r.by === "Phoenix");
    const denver = blogVerdensRaekker().find((r) => r.by === "Denver");
    // Samme vinterforskel — de ligger i samme zone.
    expect(phoenix?.tekstVinter).toBe(denver?.tekstVinter);
    // Men i dansk sommertid står Phoenix en time *længere* bagud, fordi
    // Arizona undtaget fra sommertid i 1967 og Danmark ikke gjorde det.
    expect(phoenix?.sommer).toBe((phoenix?.vinter ?? 0) - 1);
    expect(denver?.sommer).toBeUndefined();
  });

  test("de byer, der skifter selv, står med samme forskel hele året", () => {
    // London er 1 time bagud om vinteren og 2 om sommeren. Det er ikke en
    // modsigelse — Danmark flytter sig med. Skriver artiklen "2 timer bagud"
    // i vinterkolonnen, er den forkert i halvdelen af året.
    const london = blogVerdensRaekker().find((r) => r.by === "London");
    expect(london?.tekstVinter).toBe("1 time bagud");
    expect(london?.sommer).toBeUndefined();

    const madrid = blogVerdensRaekker().find((r) => r.by === "Madrid");
    expect(madrid?.tekstVinter).toBe("Samme tid");
    expect(madrid?.sommer).toBeUndefined();
  });

  test("Mumbai står med sit brudtal, fordi Indien ligger på UTC+5:30", () => {
    const mumbai = blogVerdensRaekker().find((r) => r.by === "Mumbai");
    expect(mumbai?.vinter).toBe(4.5);
    // `String(4.5).replace(".", ",")` — dansk komma, fordi artiklen siger
    // "4,5 time foran" og en prik dér ville være en dansk skrivefejl.
    expect(mumbai?.tekstVinter).toBe("4,5 timer frem");
  });

  test("Auckland er den østligste by i tabellen — den afslutter rækkerne", () => {
    const raekker = blogVerdensRaekker();
    expect(raekker[raekker.length - 1].by).toBe("Auckland");
    // NZST er UTC+12, dansk vintertid UTC+1, så 12 − 1 = 11 timer frem.
    expect(raekker[raekker.length - 1].vinter).toBe(11);
    expect(raekker[raekker.length - 1].tekstVinter).toBe("11 timer frem");
  });

  test("Ingen række springer byer fra listen over", () => {
    // `zoneFor` kaster på en ukendt by, så springer-over ville vælte hele
    // tabellen ved rendering i stedet for at give en tavs forkert side.
    const raekker = blogVerdensRaekker();
    for (let i = 1; i < raekker.length; i += 1) {
      const foer = TIDSZONER.findIndex((z) => z.by === raekker[i - 1].by);
      const nu = TIDSZONER.findIndex((z) => z.by === raekker[i].by);
      expect(nu, raekker[i].by).toBeGreaterThan(-1);
      // Rækkefølgen er ikke TIDSZONER's, så vi kan ikke kræve stigning —
      // men ingen by må stå to gange.
      expect(foer).not.toBe(nu);
    }
  });

  test("forskellen til Danmark er den samme i begge sprog — der er kun dansk", () => {
    // Bloggen er dansk-only: `beraknare.se` svarer 404 på slug'en, fordi
    // `routing.ts` har `/blog` i `danishOnlySections`. Derfor skal modulet
    // ikke have en svensk arm — det ville være kode uden en side at vise den
    // på. Målt, ikke antaget.
    const kilde = laes("src/lib/routing.ts");
    expect(kilde).toContain('const danishOnlySections = ["/blog", "/kategori"]');

    // Og forskellen er et tal, ikke en tekst, så den kan ikke lække dansk
    // til en svensk side (C73's R4).
    for (const raekke of blogVerdensRaekker()) {
      expect(typeof raekke.vinter).toBe("number");
      expect(typeof raekke.sommer === "number" || raekke.sommer === undefined).toBe(
        true
      );
    }
  });
});
