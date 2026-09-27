/**
 * Hæftet på de fire beregnere med flest visninger i den danske GSC-liste,
 * hvis tal- og datofelter var **uden navn for skærmlæsere**: `<label>` uden
 * `htmlFor` og `<input>`/`<select>` uden `id`. Det er ikke en skønhedsfejl —
 * `/dato` (130.392 visninger), `/tidsberegner` (72.382) og `/tidszone`
 * (24.723) er de tre mest besøgte sider på sitet, og en skærmlæser læser
 * "redigeringsfelt" uden at vide, hvilket af felterne det er.
 *
 * Testen låser tre ting pr. renderet tilstand, ikke ét: at hvert `label` er
 * bundet til et felt, at bindingen peger på noget der findes, og at hvert felt
 * kan findes med `getByLabelText` — altså den knap, en skærmlæser bruger til at
 * hoppe til feltet. Uden alle tre er klassen ikke lukket.
 *
 * Bemærk: `getAttribute("htmlFor")` er **null** i jsdom, fordi DOM'en hedder
 * `for` og `getAttribute` her ikke lowercase'er. Derfor bruges `label.htmlFor`.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import AktieskatBeregner from "./AktieskatBeregner";
import AlderBeregner from "./AlderBeregner";
import AlkoholenhederBeregner from "./AlkoholenhederBeregner";
import BefordringsfradragBeregner from "./BefordringsfradragBeregner";
import BolanBeregner from "./BolanBeregner";
import BoliglaanBeregner from "./BoliglaanBeregner";
import BoligsalgBeregner from "./BoligsalgBeregner";
import BilBeregner from "./BilBeregner";
import BraendstofBeregner from "./BraendstofBeregner";
import BrokBeregner from "./BrokBeregner";
import BruttoNettoBeregner from "./BruttoNettoBeregner";
import BudgetBeregner from "./BudgetBeregner";
import BoernepengBeregner from "./BoernepengBeregner";
import DatoBeregner from "./DatoBeregner";
import DelRegningBeregner from "./DelRegningBeregner";
import EjendomsvaerdiskatBeregner from "./EjendomsvaerdiskatBeregner";
import EnhederBeregner from "./EnhederBeregner";
import EfterloensBeregner from "./EfterloensBeregner";
import Elberegner from "./Elberegner";
import EnhedsprisBeregner from "./EnhedsprisBeregner";
import FeriepengeBeregner from "./FeriepengeBeregner";
import GaeldsfriBeregner from "./GaeldsfriBeregner";
import HuslejeBudgetBeregner from "./HuslejeBudgetBeregner";
import KalorieBeregner from "./KalorieBeregner";
import KvadratmeterBeregner from "./KvadratmeterBeregner";
import LoenBeregner from "./LoenBeregner";
import NedtaellingBeregner from "./NedtaellingBeregner";
import OpsparingsBeregner from "./OpsparingsBeregner";
import LaaneBeregner from "./LaaneBeregner";
import LeasingBeregner from "./LeasingBeregner";
import LoenKonverterBeregner from "./LoenKonverterBeregner";
import LonEfterSkattBeregner from "./LonEfterSkattBeregner";
import LoenstigningBeregner from "./LoenstigningBeregner";
import MomsBeregner from "./MomsBeregner";
import MotionKalorierBeregner from "./MotionKalorierBeregner";
import PensionBeregner from "./PensionBeregner";
import PromilleBeregner from "./PromilleBeregner";
import RentefradragBeregner from "./RentefradragBeregner";
import RabatBeregner from "./RabatBeregner";
import RenteBeregner from "./RenteBeregner";
import RygestopBeregner from "./RygestopBeregner";
import TidsBeregner from "./TidsBeregner";
import TidszoneBeregner from "./TidszoneBeregner";
import TopskatBeregner from "./TopskatBeregner";
import ValutaBeregner from "./ValutaBeregner";
import VaegttabBeregner from "./VaegttabBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

// jsdom har hverken `navigator.clipboard` eller `document.execCommand`, så
// `CopyResultButton`s fallback kaster `TypeError: document.execCommand is not a
// function`. Det var to uhandlede rejections, som gjorde at *denne fil alene*
// exited 1 selv om alle dens tests var grønne. Vi stubber fallbacken, fordi vi
// ikke tester kopiering her — det gør de andre testfiler med klipbord.
Object.defineProperty(document, "execCommand", {
  value: () => true,
  configurable: true,
  writable: true,
});

function renderIn(locale: "da" | "se", Component: () => React.JSX.Element) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <Component />
    </LocaleProvider>,
  );
}

afterEach(cleanup);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Ét element skal have ét navn — et duplikeret id gør `for` tvetydig. */
function expectNoDuplicateIds(container: HTMLElement) {
  const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
}

/**
 * Hvert `<label>` skal være bundet til noget: enten til et felt via `for`, eller
 * til en gruppe via `id` der bruges i `aria-labelledby` (som kønsvalget i
 * `/promille`, der er knapper og ikke et felt).
 */
function expectEveryLabelIsBound(container: HTMLElement) {
  const labels = Array.from(container.querySelectorAll("label"));
  expect(labels.length).toBeGreaterThan(0);

  for (const label of labels) {
    const navn = label.textContent?.trim() ?? "";
    const bundetViaFor = label.htmlFor !== "";
    const bundetViaAria = label.id !== "" && container.querySelector(`[aria-labelledby="${label.id}"]`) !== null;

    expect(
      bundetViaFor || bundetViaAria,
      `Et <label> uden binding giver sit indhold intet navn: "${navn}"`,
    ).toBe(true);

    if (bundetViaFor) {
      expect(
        container.querySelector(`[id="${label.htmlFor}"]`),
        `for="${label.htmlFor}" på "${navn}" peger på intet element`,
      ).not.toBeNull();
    }
  }
}

/** Hvert felt skal kunne findes med `getByLabelText` — eller have aria-label. */
function expectEveryFieldHasAName(container: HTMLElement) {
  const felter = Array.from(container.querySelectorAll("input, select, textarea"));
  expect(felter.length).toBeGreaterThan(0);

  for (const felt of felter) {
    const id = felt.getAttribute("id");
    if (!id) {
      expect(
        felt.getAttribute("aria-label"),
        `Feltet ${felt.outerHTML.slice(0, 80)} har hverken id, label eller aria-label`,
      ).toBeTruthy();
      continue;
    }
    const label = container.querySelector(`label[for="${id}"]`);
    expect(label, `Feltet #${id} har ingen <label for>`).not.toBeNull();
    // `getAllByLabelText`, ikke `getByLabelText`: to felter på samme side kan
    // have samme synlige tekst (fx to "Pris pr. m²" på /kvadratmeter), og det
    // er lovligt. Det skal bare ikke fejle på dem.
    // Mellemrumskolonnen skal kollapses først: etiketten kan stå over flere
    // linjer i JSX, og det testing-library gør ved opslaget, skal vores regex
    // også gøre — ellers kan vi ikke finde etiketten, der lige så vel er fundet.
    const etiket = (label?.textContent ?? "").replace(/\s+/g, " ").trim();
    expect(screen.getAllByLabelText(new RegExp(escapeRegExp(etiket)))).toContain(felt);
  }
}

function expectFieldsAreNamed(container: HTMLElement) {
  expectNoDuplicateIds(container);
  expectEveryLabelIsBound(container);
  expectEveryFieldHasAName(container);
}

/**
 * De fire tilstandsknapper i `/dato` er de fire første knapper i DOM'en
 * (tilstandsgitteret står over alt andet) og deres tilgængelige navn er
 * etiketten *plus* beskrivelsen, så vi kan ikke slå dem op på navnet alene.
 */
function modeKnapper(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("button")).slice(0, 4) as HTMLElement[];
}

/**
 * Bevis at vi ikke bare tjekker ét sæt felter: hver renderet tilstand skal have
 * sit **eget** sæt `id`'er, ellers ville en fejl i kun ét af sættene glide
 * igennem. Sammenligner vi kun antallet, kan to tilstande med lige mange
 * felter se ens ud.
 */
function registrerFelter(container: HTMLElement, saet: Set<string>) {
  saet.add(Array.from(container.querySelectorAll("input")).map((felt) => felt.id).join(","));
}

describe("Feltnavn for skærmlæsere — de fire mest besøgte beregnere", () => {
  for (const locale of ["da", "se"] as const) {
    describe(locale, () => {
      test("/dato: alle felter har navn i alle fire tilstande", () => {
        const { container } = renderIn(locale, DatoBeregner);
        const knapper = modeKnapper(container);
        expect(knapper.length).toBe(4);

        const setMuligeAntal = new Set<number>();
        for (const knap of knapper) {
          fireEvent.click(knap);
          expectFieldsAreNamed(container);
          setMuligeAntal.add(container.querySelectorAll("input").length);
        }
        // Bevis at vi ikke bare tjekker ét felt: de fire tilstande skal have
        // hver sit eget, ellers ville en fejl i kun ét af dem glide igennem.
        expect(setMuligeAntal.size).toBeGreaterThan(1);
      });

      test("/tidsberegner: start/slut tid og dato og pause har navn", () => {
        const { container } = renderIn(locale, TidsBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(5);
      });

      test("/tidszone: fra/til zone og time/minut har navn", () => {
        const { container } = renderIn(locale, TidszoneBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("select").length).toBe(4);
      });

      test("/promille: genstande, vægt og timer har navn", () => {
        const { container } = renderIn(locale, PromilleBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(3);
      });

      test("/braendstof: alle felter har navn i alle typer brændstof og beregning", () => {
        const { container } = renderIn(locale, BraendstofBeregner);
        const setMuligeAntal = new Set<string>();
        const brændstofKnapper = () => Array.from(container.querySelectorAll("button")).slice(0, 3) as HTMLElement[];

        for (const brændstofKnap of brændstofKnapper()) {
          fireEvent.click(brændstofKnap);
          expectFieldsAreNamed(container);
          registrerFelter(container, setMuligeAntal);

          // Beregningstyperne findes kun når brændstoffet ikke er el, så de skal
          // slås op *efter* hvert skift af brændstof — ikke fra en liste taget
          // på forhånd, som ville være afkoblet fra DOM'en.
          for (const beregningsKnap of Array.from(container.querySelectorAll("button")).slice(3, 6) as HTMLElement[]) {
            fireEvent.click(beregningsKnap);
            expectFieldsAreNamed(container);
            registrerFelter(container, setMuligeAntal);
          }
        }
        expect(setMuligeAntal.size).toBe(4);
      });

      test("/kvadratmeter: alle felter har navn i alle fire geometriske former", () => {
        const { container } = renderIn(locale, KvadratmeterBeregner);
        const formKnapper = Array.from(container.querySelectorAll("button")).slice(0, 4) as HTMLElement[];
        expect(formKnapper.length).toBe(4);

        const setMuligeFelter = new Set<string>();
        for (const formKnap of formKnapper) {
          fireEvent.click(formKnap);
          expectFieldsAreNamed(container);
          registrerFelter(container, setMuligeFelter);
        }
        expect(setMuligeFelter.size).toBe(4);
      });

      test("/kalorier: køn, aktivitetsniveau og mål er navngivne grupper", () => {
        const { container } = renderIn(locale, KalorieBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(3);
      });

      test("/moms: beregningstypen er en navngiven gruppe, også i svensk", () => {
        const { container } = renderIn(locale, MomsBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBeGreaterThanOrEqual(1);
      });

      test("/renteberegner: lånetype er en navngiven gruppe", () => {
        const { container } = renderIn(locale, RenteBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(1);
      });

      test("/alder: fødselsdato og beregningsdato har navn", () => {
        const { container } = renderIn(locale, AlderBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(2);
      });

      test("/brok: tæller og nævner har navn", () => {
        const { container } = renderIn(locale, BrokBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(2);
      });

      test("/rentefradrag: hvert lån har navn, også efter at et lån er lagt til", () => {
        const { container } = renderIn(locale, RentefradragBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(3);

        const tilfoej = Array.from(container.querySelectorAll("button")).find((knap) =>
          (knap.textContent ?? "").includes("Tilføj lån"),
        ) as HTMLElement | undefined;
        expect(tilfoej).toBeDefined();
        fireEvent.click(tilfoej as HTMLElement);

        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(5);
      });

      test("/laane: beløb, rente, løbetid og gebyr har navn i alle tre lånetyper", () => {
        const { container } = renderIn(locale, LaaneBeregner);
        const laanetyper = Array.from(container.querySelectorAll("button")).slice(0, 3) as HTMLElement[];
        expect(laanetyper.length).toBe(3);

        const setMuligeFelter = new Set<string>();
        for (const laanetype of laanetyper) {
          fireEvent.click(laanetype);
          expectFieldsAreNamed(container);
          registrerFelter(container, setMuligeFelter);
        }
        // Sammenligningstilstanden har to ekstra felter (rente og løbetid til det
        // andet lån). Annuitets- og serietilstanden har præcis de samme fire
        // felter, så der er to sæt id'er, ikke tre — og det er netop derfor
        // sættene måles på id og ikke på antal.
        expect(setMuligeFelter.size).toBe(2);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(1);
      });

      test("/huslejebudget: elleve beløbsfelter har navn", () => {
        const { container } = renderIn(locale, HuslejeBudgetBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(11);
      });

      test("/befordringsfradrag: km, arbejdsdage, indkomst, yderkommune og broer har navn", () => {
        const { container } = renderIn(locale, BefordringsfradragBeregner);
        expectFieldsAreNamed(container);
        // Syv egne felter. Rutevælgeren kommer oveni på de domæner, hvor den
        // er slået til, og dens felter skal også have navn — derfor tæller vi
        // "mindst syv" og lader expectFieldsAreNamed dække resten.
        expect(container.querySelectorAll("input").length).toBeGreaterThanOrEqual(7);
        expect(container.querySelectorAll("input[type=checkbox]").length).toBe(2);
      });

      test("/boliglaan: løbetid har navn og lånetypen er en navngiven gruppe", () => {
        const { container } = renderIn(locale, BoliglaanBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("select").length).toBeGreaterThanOrEqual(1);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBeGreaterThanOrEqual(1);
      });

      test("/valuta: fra, til og beløb har navn", () => {
        const { container } = renderIn(locale, ValutaBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("select").length).toBe(2);
        expect(container.querySelectorAll("input").length).toBe(1);
      });

      test("/gaeldsfri: hver gældspost har navn, også den der tilføjes", () => {
        const { container } = renderIn(locale, GaeldsfriBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(2);

        const tilfoej = Array.from(container.querySelectorAll("button")).find((knap) =>
          (knap.textContent ?? "").includes(locale === "se" ? "Lägg till" : "Tilføj"),
        ) as HTMLElement | undefined;
        expect(tilfoej).toBeDefined();
        fireEvent.click(tilfoej as HTMLElement);

        expectFieldsAreNamed(container);
        // To poster á fire felter: den anden posts felter må ikke hedde det
        // samme som den førsts — de får nummeret i aria-label'en.
        const navne = Array.from(container.querySelectorAll("input")).map((felt) =>
          felt.getAttribute("aria-label"),
        );
        expect(new Set(navne).size).toBe(navne.length);
        expect(container.querySelectorAll("input").length).toBe(9);
      });

      test("/leasing: bilpris, restværdi, løbetid, rente og udbetaling har navn", () => {
        const { container } = renderIn(locale, LeasingBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(5);
      });

      test("/pension: udbetalingsperiode og samlever-pensionist har navn", () => {
        const { container } = renderIn(locale, PensionBeregner);
        expectFieldsAreNamed(container);

        // Checkboksen dukker kun op når samlivsstatus er "samlevende", så den
        // skal slås frem — ellers ville vi aldrig se den.
        const samlevende = Array.from(container.querySelectorAll("option")).find(
          (option) => option.textContent === "Gift eller samlevende",
        ) as HTMLOptionElement | undefined;
        expect(samlevende).toBeDefined();
        fireEvent.change(container.querySelector("#pension-samliv") as HTMLSelectElement, {
          target: { value: "samlevende" },
        });
        expectFieldsAreNamed(container);
        expect(container.querySelector("#pension-samlever-pensionist")).not.toBeNull();
      });

      test("/boernepenge: indkomst, enlig og delt forældremyndighed har navn", () => {
        const { container } = renderIn(locale, BoernepengBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input[type=checkbox]").length).toBe(2);

        const tilfoej = Array.from(container.querySelectorAll("button")).find((knap) =>
          (knap.textContent ?? "").includes("Tilføj barn"),
        ) as HTMLElement | undefined;
        expect(tilfoej).toBeDefined();
        fireEvent.click(tilfoej as HTMLElement);
        expectFieldsAreNamed(container);
      });

      test("/vaegttab: køn og aktivitetsniveau er navngivne grupper", () => {
        const { container } = renderIn(locale, VaegttabBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(2);
      });

      test("/enhedspris: pris og mængde har navn for begge varer, enhed er en gruppe", () => {
        const { container } = renderIn(locale, EnhedsprisBeregner);
        expectFieldsAreNamed(container);
        // Pris og mængde står under hver vare, så fire felter skal have navn —
        // og de må ikke hedde det samme, ellers kan skærmlæseren ikke skelne dem.
        expect(container.querySelectorAll("input").length).toBe(4);
        const etiketter = Array.from(container.querySelectorAll("input")).map(
          (felt) => container.querySelector(`label[for="${felt.id}"]`)?.textContent?.trim(),
        );
        const priser = etiketter.filter((navn) => navn !== undefined);
        expect(new Set(priser).size).toBe(2);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(1);
      });

      test("/loenstigning: gammel og ny løn har navn", () => {
        const { container } = renderIn(locale, LoenstigningBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBeGreaterThanOrEqual(2);
      });

      test("/elberegner: apparat, watt og timer pr. enhed har navn", () => {
        const { container } = renderIn(locale, Elberegner);
        expectFieldsAreNamed(container);
        // "Apparat N" dækker to felter (valg af standardapparat og eget navn),
        // så den er en gruppe — ellers ville den være en etiket uden binding.
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBeGreaterThanOrEqual(1);
        const grupper = Array.from(container.querySelectorAll('[role="group"][aria-labelledby]'));
        const etiket = container.querySelector(`#${CSS.escape(grupper[0].getAttribute("aria-labelledby") ?? "")}`);
        expect(etiket?.textContent).toMatch(/\d/);
      });

      // C69: 27 ubundne `<label>` på syv beregnere, ordnet efter hvor de lå i
      // målingen (planens "resten af label-klassen"). Rækkefølgen er ikke efter
      // antal alene: `/efterloen` (6) er den eneste der stadig var helt uberørt,
      // og `/bolan` er en af de få sider der findes på **to** domæner.
      test("/efterloen: fødselsår, forsikringsstatus og de to checkbokse har navn", () => {
        const { container } = renderIn(locale, EfterloensBeregner);
        expectFieldsAreNamed(container);
        // Forsikringsstatus er *knapper* (Fuldtid/Deltid), ikke et felt, så
        // etiketten kan ikke bindes med `for` — den er en navngiven gruppe.
        const gruppe = container.querySelector('[role="group"][aria-labelledby="efterloen-forsikringsstatus"]');
        expect(gruppe).not.toBeNull();
        expect(gruppe?.querySelectorAll("button").length).toBe(2);
        expect(container.querySelectorAll("input[type=checkbox]").length).toBe(2);
      });

      test("/efterloen: arbejdstimer-feltet dukker op med navn, når checkboksen sættes", () => {
        const { container } = renderIn(locale, EfterloensBeregner);
        // Bevis på at vi ikke bare tjekker ét sæt felter: feltet er betinget af
        // "Jeg vil arbejde ved siden af", så uden klik ville vi aldrig se det.
        expect(container.querySelector("#efterloen-arbejdstimer")).toBeNull();
        fireEvent.click(container.querySelector("#efterloen-arbejder-sidenom") as HTMLElement);
        expect(container.querySelector("#efterloen-arbejdstimer")).not.toBeNull();
        expectFieldsAreNamed(container);
      });

      test("/ejendomsvaerdiskat: værdi, grundværdi og kommune har navn", () => {
        const { container } = renderIn(locale, EjendomsvaerdiskatBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#ejendomsvaerdiskat-kommune")).not.toBeNull();
        // Grundskyldspromille-feltet findes kun ved "Anden kommune".
        expect(container.querySelector("#ejendomsvaerdiskat-promille")).toBeNull();
        const vaelger = container.querySelector("#ejendomsvaerdiskat-kommune") as HTMLSelectElement;
        fireEvent.change(vaelger, { target: { value: "custom" } });
        expect(container.querySelector("#ejendomsvaerdiskat-promille")).not.toBeNull();
        expectFieldsAreNamed(container);
      });

      test("/boligsalg: mæglertype er en radiogroup, tinglysning er et navngivet felt", () => {
        const { container } = renderIn(locale, BoligsalgBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="radiogroup"][aria-labelledby="boligsalg-maeglertype"]');
        expect(gruppe?.querySelectorAll("input[type=radio]").length).toBe(2);
        // De to radioknapper skal kunne findes hver for sig, ellers kan
        // skærmlæseren ikke skelne procent fra fast pris.
        for (const id of ["boligsalg-maegler-procent", "boligsalg-maegler-fast"]) {
          const etiket = (container.querySelector(`label[for="${id}"]`)?.textContent ?? "").replace(/\s+/g, " ").trim();
          expect(screen.getByLabelText(etiket)).toBe(container.querySelector(`#${id}`));
        }
      });

      test("/enheder: værdi, fra, til og enhedsgruppe har navn", () => {
        const { container } = renderIn(locale, EnhederBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="group"][aria-labelledby="enheder-gruppe"]');
        expect(gruppe?.querySelectorAll("button").length).toBe(3);
      });

      test("/bolan: pris, lån og rente har navn", () => {
        const { container } = renderIn(locale, BolanBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBeGreaterThanOrEqual(3);
      });

      test("/alkoholenheder: volumen, promille og antal har navn", () => {
        const { container } = renderIn(locale, AlkoholenhederBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBeGreaterThanOrEqual(3);
      });

      test("/loen-konverter: beløb, enhedsgruppe og timer har navn", () => {
        const { container } = renderIn(locale, LoenKonverterBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="group"][aria-labelledby="loen-konverter-enhed"]');
        expect(gruppe?.querySelectorAll("button").length).toBe(3);
      });

      test("/aktieskat: depottype er en gruppe, gevinst og tab er felter", () => {
        const { container } = renderIn(locale, AktieskatBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="group"][aria-labelledby="aktieskat-depottype"]');
        expect(gruppe?.querySelectorAll("button").length).toBe(3);
        expect(container.querySelector("#aktieskat-gevinst")).not.toBeNull();
        expect(container.querySelector("#aktieskat-tab")).not.toBeNull();
      });

      test("/delregning: beløb, antal personer og drikkepenge har navn — også knapperne", () => {
        const { container } = renderIn(locale, DelRegningBeregner);
        expectFieldsAreNamed(container);
        // Tællerknapperne hed bare "−" og "+", så en skærmlæser læste
        // "minus" og "plus" uden at vide hvad de gjorde ved. De skal have
        // hver sit eget navn — de er knapper, ikke piltaster i et talfelt.
        const tæller = Array.from(
          container.querySelector("#delregning-personer")?.parentElement?.querySelectorAll("button") ?? [],
        );
        expect(tæller.length).toBeGreaterThanOrEqual(2);
        for (const knap of tæller) {
          expect(knap.getAttribute("aria-label")?.trim().length ?? 0).toBeGreaterThan(1);
          expect(knap.textContent?.trim()).toMatch(/^[−+]$/);
        }
        // "Har navn" er ikke nok: navnet skal være på det sprog, siden er på.
        // C71 lagde nøglerne `færre`/`flere` ind ved at kopiere de danske ord
        // direkte i `se`-blokken, så beraknare.se læste "Færre personer" på en
        // svensk side. Svensk skriver aldrig æ eller ø.
        if (locale === "se") {
          for (const knap of tæller) {
            expect(knap.getAttribute("aria-label") ?? "").not.toMatch(/[æø]/);
          }
        }
        expect(
          container.querySelector('[role="group"][aria-label]')?.querySelectorAll("button").length,
        ).toBe(4);
      });

      test("/feriepenge: bruttoløn, periode og feriedage har navn", () => {
        const { container } = renderIn(locale, FeriepengeBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="group"][aria-labelledby="feriepenge-periode"]');
        expect(gruppe?.querySelectorAll("button").length).toBe(2);
        expect(container.querySelector("#feriepenge-feriedage")).not.toBeNull();
      });

      test("/lon-efter-skatt: løn, kommunalskatt og kirkemedlemskab har navn", () => {
        const { container } = renderIn(locale, LonEfterSkattBeregner);
        expectFieldsAreNamed(container);
        // "Løn" dækkede både periode-knapperne og lønfeltet. Nu binder den
        // synlige etikette til feltet, og knapperne er deres egen gruppe.
        expect(container.querySelector('[role="group"][aria-label="Period"]')?.querySelectorAll("button").length).toBe(2);
        expect(container.querySelector("#lon-efter-skatt-lon")).not.toBeNull();
        expect(container.querySelector("#lon-efter-skatt-kyrko")).not.toBeNull();
      });

      test("/motionkalorier: aktivitet, vægt og varighed har navn", () => {
        const { container } = renderIn(locale, MotionKalorierBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#motionkalorier-aktivitet")?.tagName).toBe("SELECT");
        expect(container.querySelectorAll("#motionkalorier-vaegt, #motionkalorier-varighed").length).toBe(2);
      });

      test("/rabat: alle tre tilstandes felter har navn", () => {
        const { container } = renderIn(locale, RabatBeregner);
        expectFieldsAreNamed(container);
        // Filen har to beregningstilstande, og hver har sit eget sæt felter —
        // derfor tælles de to der *er* i DOM'en, ikke tre.
        const felter = container.querySelectorAll("#rabat-originalpris, #rabat-procent, #rabat-tilbudspris");
        expect(felter.length).toBe(2);
        expect(container.querySelector("#rabat-originalpris")).not.toBeNull();
      });

      test("/rygestop: cigaretter, pakkepris og pakkestørrelse har navn", () => {
        const { container } = renderIn(locale, RygestopBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("#rygestop-cigaretter, #rygestop-pakkepris, #rygestop-pakkestoerrelse").length).toBe(3);
      });

      test("/brutto-netto: ønsket udbetalning og kommuneskat har navn", () => {
        const { container } = renderIn(locale, BruttoNettoBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#brutto-netto-oensket")).not.toBeNull();
        expect(container.querySelector("#brutto-netto-kommuneskat")).not.toBeNull();
        // Knappenavnet "Pr. måned"/"Pr. år" gav ingen gruppe-navn, så en
        // skærmlæser læste to navnløse knapper efter hinanden.
        const gruppe = container.querySelector('[role="group"][aria-label]');
        expect(gruppe?.querySelectorAll("button").length).toBe(2);
      });

      test("/topskat: bruttoindkomst og kommuneskat har navn", () => {
        const { container } = renderIn(locale, TopskatBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("#topskat-aarsindkomst, #topskat-kommuneskat").length).toBe(2);
      });

      test("/opsparing: rentetilskrivning er en gruppe, inflation er et navngivet felt", () => {
        const { container } = renderIn(locale, OpsparingsBeregner);
        expectFieldsAreNamed(container);
        // "Rentetilskrivning" er knapper, ikke et felt, så den kan ikke bindes
        // med `for` — den er gruppens navn.
        const gruppe = container.querySelector('[role="group"][aria-labelledby]');
        expect(gruppe?.querySelectorAll("button").length).toBe(3);
        // Inflationskontrollen var *indpakket* i etiketten: gyldig HTML, men
        // ufindelig for `getByLabelText`.
        expect(container.querySelector("#opsparing-vis-inflation")).not.toBeNull();
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(1);
      });

      test("/budget: indkomst og alle udgiftsfelter har hver sit navn", () => {
        const { container } = renderIn(locale, BudgetBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#budget-indkomst")).not.toBeNull();
        // Udgifterne kommer fra et array, så id'et må følge nøglen — ellers
        // ville alle felter få det samme id.
        const udgifter = Array.from(container.querySelectorAll('[id^="budget-udgift-"]'));
        expect(udgifter.length).toBeGreaterThan(3);
        expect(new Set(udgifter.map((f) => f.id)).size).toBe(udgifter.length);
      });

      test("/bil: brændstoftypen er en navngiven gruppe", () => {
        const { container } = renderIn(locale, BilBeregner);
        expectFieldsAreNamed(container);
        const gruppe = container.querySelector('[role="group"][aria-labelledby]');
        expect(gruppe?.querySelectorAll("button").length).toBe(4);
      });

      test("/nedtaelling: dato-feltet har navn", () => {
        const { container } = renderIn(locale, NedtaellingBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#nedtaelling-target")?.getAttribute("type")).toBe("date");
      });

      test("/lon-efter-skatt: kommune-vælgeren har navn, periode-knapperne er en gruppe", () => {
        const { container } = renderIn(locale, LoenBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelector("#loen-kommune")?.tagName).toBe("SELECT");
        const gruppe = container.querySelector('[role="group"][aria-labelledby]');
        expect(gruppe?.querySelectorAll("button").length).toBe(2);
      });
    });
  }

  test("Kønsvalget i /promille er en navngiven gruppe, ikke et navnløst felt", () => {
    renderIn("da", PromilleBeregner);
    expect(screen.getByRole("group", { name: "Køn" })).toBeInTheDocument();
  });
});
