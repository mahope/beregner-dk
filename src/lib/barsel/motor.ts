/**
 * Rule engine: classifies every planned week, allocates it to the parents'
 * entitlement buckets, handles transfers between the parents and produces
 * Danish validation messages and notice deadlines.
 *
 * Pure TypeScript, no React. See docs/barsel/regler-2026.md for the rules.
 */

import { addDays, addMonths, formatDato, weekEnd, weekStart } from "./dato";
import { celleFor, orlovsandel, type UgeCelle } from "./perioder";
import {
  REGLER,
  erAdoption,
  erSolo,
  oeremaerkningGaelder,
  rettigheder,
  type Rettigheder,
  type Spand,
  type SpandId,
} from "./regler";
import type { BarselsPlan, ForaelderId, Kategori } from "./types";

export type Niveau = "fejl" | "advarsel" | "info";

export interface Besked {
  id: string;
  niveau: Niveau;
  titel: string;
  tekst: string;
  foraelder?: ForaelderId;
}

export interface UgeAnalyse {
  uge: number;
  celle: UgeCelle | null;
  /** Share of a full leave week (0-1). */
  andel: number;
  /** Leave share by category (with benefits unless "uden-ret"). */
  fordeling: Partial<Record<Kategori, number>>;
  /** Dominant category used for colouring. */
  kategori: Kategori;
}

export interface Forbrug {
  spand: Spand;
  brugt: number;
  /** Used by the other person through a transfer. */
  afgivet: number;
  /** Reserved as postponed leave. */
  udskudt: number;
  rest: number;
}

export interface ForaelderAnalyse {
  id: ForaelderId;
  navn: string;
  rettigheder: Rettigheder;
  uger: Map<number, UgeAnalyse>;
  forbrug: Forbrug[];
  /** Weeks with benefits used after the birth (own + received). */
  brugtEfter: number;
  brugtFoer: number;
  modtaget: number;
  afgivet: number;
  udenRet: number;
  tabteOeremaerkede: number;
  ubrugteDelbare: number;
  udskudt: number;
  /** Part-time extension of the deadline, in weeks. */
  deltidsForlaengelse: number;
  frist: number;
  foersteUge: number | null;
  sidsteUge: number | null;
}

export interface Varsel {
  foraelder: ForaelderId;
  dato: string;
  titel: string;
  tekst: string;
  kilde: string;
}

export interface Analyse {
  anker: string;
  foraeldre: ForaelderAnalyse[];
  beskeder: Besked[];
  varsler: Varsel[];
  faellesUger: number;
  /** Weeks where at least one parent is at home on leave or holiday. */
  foersteUge: number;
  sidsteUge: number;
}

const PRIORITET: SpandId[] = [
  "foer",
  "pligt",
  "foedsel",
  "tidlig",
  // Buckets restricted to the first 10 weeks must be used before the wide ones.
  "tidlig-delbar",
  "oeremaerket",
  "flerling",
  "indlaeggelse",
  "delbar",
  "solo",
];

const EPS = 1e-9;
const rund = (n: number) => Math.round(n * 100) / 100;

function tilfoej(f: Partial<Record<Kategori, number>>, k: Kategori, n: number) {
  if (n > EPS) f[k] = (f[k] ?? 0) + n;
}

function dominant(f: Partial<Record<Kategori, number>>, celle: UgeCelle | null): Kategori {
  if (!celle) return "arbejde";
  if (celle.type === "ferie") return "ferie";
  let best: Kategori = "uden-ret";
  let max = -1;
  for (const [k, v] of Object.entries(f) as [Kategori, number][]) {
    if (v > max + EPS) {
      best = k;
      max = v;
    }
  }
  return best;
}

/** Transfer window for a bucket when used by the other person. */
function overfoerselsVindue(s: Spand, modtagerFrist: number): [number, number] {
  if (s.id === "tidlig-delbar") return [0, REGLER.foersteUger];
  if (s.id === "tidlig") return [0, Math.min(REGLER.fristUger, modtagerFrist)];
  return [0, Math.min(s.til, modtagerFrist)];
}

function uger(n: number): string {
  const v = rund(n);
  const tekst = Number.isInteger(v) ? String(v) : v.toLocaleString("da-DK");
  return `${tekst} ${v === 1 ? "uge" : "uger"}`;
}

export function ankerDato(plan: BarselsPlan): string {
  return plan.dato;
}

export function analyserPlan(plan: BarselsPlan, idag?: string): Analyse {
  const anker = ankerDato(plan);
  const beskeder: Besked[] = [];
  const solo = erSolo(plan.konstellation);
  const adoption = erAdoption(plan.konstellation);

  // ── Pass 1: own buckets ────────────────────────────────────────────────
  const analyser: ForaelderAnalyse[] = plan.foraeldre.map((f, index) => {
    const ret = rettigheder(plan, f, index);
    const forbrug: Forbrug[] = ret.spande.map((s) => ({ spand: s, brugt: 0, afgivet: 0, udskudt: 0, rest: s.uger }));

    // Reserve postponed weeks from the non-earmarked, transferable buckets.
    let udskyd = Math.max(0, f.udskudteUger);
    for (const id of ["delbar", "solo"] as SpandId[]) {
      const b = forbrug.find((x) => x.spand.id === id);
      if (!b || udskyd <= 0) continue;
      const take = Math.min(b.rest, udskyd);
      b.udskudt += take;
      b.rest -= take;
      udskyd -= take;
    }

    const map = new Map<number, UgeAnalyse>();
    let deltid = 0;
    let foerste: number | null = null;
    let sidste: number | null = null;
    const weeks = new Set<number>();
    for (const p of f.perioder) for (let w = p.start; w < p.slut; w++) weeks.add(w);
    for (const w of [...weeks].sort((a, b) => a - b)) {
      const celle = celleFor(f.perioder, w);
      const andel = orlovsandel(celle);
      if (celle?.type === "deltid") deltid += 1 - andel;
      if (celle && celle.type !== "ferie") {
        foerste = foerste === null ? w : Math.min(foerste, w);
        sidste = sidste === null ? w : Math.max(sidste, w);
      }
      const fordeling: Partial<Record<Kategori, number>> = {};
      let rest = andel;
      if (rest > EPS) {
        const sorted = [...forbrug].sort(
          (a, b) => PRIORITET.indexOf(a.spand.id) - PRIORITET.indexOf(b.spand.id)
        );
        for (const b of sorted) {
          if (rest <= EPS) break;
          if (w < b.spand.fra || w >= b.spand.til + (b.spand.id === "foer" ? 0 : deltidsBuffer(deltid, b.spand))) continue;
          const take = Math.min(b.rest, rest);
          if (take <= EPS) continue;
          b.brugt += take;
          b.rest -= take;
          rest -= take;
          tilfoej(fordeling, b.spand.kategori, take);
        }
      }
      // Remaining leave is resolved in pass 2 (transfers) — store as "uden-ret" for now.
      tilfoej(fordeling, "uden-ret", rest);
      map.set(w, { uge: w, celle, andel, fordeling, kategori: "arbejde" });
    }

    return {
      id: f.id,
      navn: f.navn || (index === 0 ? "Forælder 1" : "Forælder 2"),
      rettigheder: ret,
      uger: map,
      forbrug,
      brugtEfter: 0,
      brugtFoer: 0,
      modtaget: 0,
      afgivet: 0,
      udenRet: 0,
      tabteOeremaerkede: 0,
      ubrugteDelbare: 0,
      udskudt: forbrug.reduce((s, b) => s + b.udskudt, 0),
      deltidsForlaengelse: deltid,
      frist: ret.frist + deltid,
      foersteUge: foerste,
      sidsteUge: sidste,
    };
  });

  // ── Pass 2: transfers from the other person ───────────────────────────
  if (analyser.length === 2) {
    for (const [modtager, giver] of [
      [analyser[0], analyser[1]],
      [analyser[1], analyser[0]],
    ]) {
      const giverBeskaeftigelse = plan.foraeldre.find((f) => f.id === giver.id)!.beskaeftigelse;
      const pulje = giver.forbrug.filter(
        (b) =>
          b.rest > EPS &&
          (b.spand.overdragelig || (b.spand.id === "oeremaerket" && !oeremaerkningGaelder(giverBeskaeftigelse) && b.spand.uger > 0)) &&
          // Only solo parents may pass the multiple-birth weeks on (to a relative)
          (b.spand.id !== "flerling" || solo)
      );
      if (pulje.length === 0) continue;
      const flerlingMaks = REGLER.flerlingTilNaertstaaendeMaks;
      let flerlingGivet = 0;
      for (const uge of [...modtager.uger.values()].sort((a, b) => a.uge - b.uge)) {
        let mangler = uge.fordeling["uden-ret"] ?? 0;
        if (mangler <= EPS || uge.uge < 0) continue;
        for (const b of pulje) {
          if (mangler <= EPS) break;
          const [fra, til] = overfoerselsVindue(b.spand, modtager.frist);
          if (uge.uge < fra || uge.uge >= til || b.rest <= EPS) continue;
          let take = Math.min(b.rest, mangler);
          if (b.spand.id === "flerling") take = Math.min(take, flerlingMaks - flerlingGivet);
          if (take <= EPS) continue;
          if (b.spand.id === "flerling") flerlingGivet += take;
          b.rest -= take;
          b.afgivet += take;
          mangler -= take;
          giver.afgivet += take;
          modtager.modtaget += take;
          uge.fordeling["uden-ret"] = mangler;
          tilfoej(uge.fordeling, "overfoert", take);
        }
        if ((uge.fordeling["uden-ret"] ?? 0) <= EPS) Reflect.deleteProperty(uge.fordeling, "uden-ret");
      }
    }
  }

  // ── Totals per parent ─────────────────────────────────────────────────
  for (const a of analyser) {
    for (const u of a.uger.values()) {
      u.kategori = dominant(u.fordeling, u.celle);
      const uden = u.fordeling["uden-ret"] ?? 0;
      a.udenRet += uden;
      const medRet = u.andel - uden;
      if (u.uge < 0) a.brugtFoer += medRet;
      else a.brugtEfter += medRet;
    }
    a.tabteOeremaerkede = a.forbrug.filter((b) => b.spand.oeremaerket).reduce((s, b) => s + b.rest, 0);
    a.ubrugteDelbare = a.forbrug
      .filter((b) => !b.spand.oeremaerket && b.spand.id !== "foer")
      .reduce((s, b) => s + b.rest, 0);
  }

  // ── Validation messages ───────────────────────────────────────────────
  plan.foraeldre.forEach((f, index) => {
    const a = analyser[index];
    const ret = a.rettigheder;
    const navn = a.navn;

    if (ret.rolle === "foedende") {
      for (const w of [0, 1]) {
        const c = celleFor(f.perioder, w);
        if (!c || c.type !== "orlov") {
          beskeder.push({
            id: `pligt-${f.id}`,
            niveau: "fejl",
            titel: `${navn} skal holde orlov de første 2 uger`,
            tekst:
              "Den fødende forælder har både ret og pligt til fravær i de 2 første uger efter fødslen. Det er ikke muligt at arbejde, holde ferie eller gå på deltid i de uger (barselsloven § 7, stk. 1 og § 12, stk. 5).",
            foraelder: f.id,
          });
          break;
        }
      }
      const foerOrlov = [-4, -3, -2, -1].filter((w) => celleFor(f.perioder, w)?.type === "orlov").length;
      if (foerOrlov < REGLER.graviditetUger && !solo) {
        beskeder.push({
          id: `graviditet-${f.id}`,
          niveau: "info",
          titel: `${navn} bruger ${foerOrlov} af 4 ugers graviditetsorlov`,
          tekst:
            "Graviditetsorloven kan ikke flyttes til efter fødslen. Uger, der ikke holdes, bortfalder. Det kan være et fornuftigt valg, hvis du har det godt og hellere vil spare på orloven.",
          foraelder: f.id,
        });
      }
    }

    if (ret.rolle === "partner" || ret.rolle === "surrogat" || ret.rolle === "adoptant") {
      const tidlig = [...a.uger.values()]
        .filter((u) => u.uge >= 0 && u.uge < REGLER.foersteUger)
        .reduce((s, u) => s + u.andel, 0);
      const krav = ret.spande.find((s) => s.id === "foedsel")?.uger ?? 0;
      if (tidlig + EPS < krav) {
        beskeder.push({
          id: `foedsel-${f.id}`,
          niveau: "advarsel",
          titel: `${navn} mister ${uger(krav - tidlig)} i de første 10 uger`,
          tekst:
            ret.rolle === "partner"
              ? "Far/medmor har 2 uger, der skal holdes inden for de første 10 uger efter fødslen. Holdes de ikke, går de tabt (barselsloven § 7, stk. 3)."
              : `Hver forælder har ${krav} ikke-overdragelige uger, der skal holdes inden for de første 10 uger (barselsloven § 8, stk. 6 / § 8 a).`,
          foraelder: f.id,
        });
      }
      if (ret.rolle === "partner" && f.beskaeftigelse === "loenmodtager") {
        const foerste10 = [...a.uger.values()].filter((u) => u.uge >= 0 && u.uge < REGLER.foersteUger && u.andel > 0);
        const blokke = foerste10.filter((u, i) => i === 0 || foerste10[i - 1].uge !== u.uge - 1).length;
        if (blokke > 1) {
          beskeder.push({
            id: `opdelt-${f.id}`,
            niveau: "info",
            titel: `${navn} deler de første uger op`,
            tekst:
              "Det er tilladt at dele de 2 uger ved fødslen op inden for de første 10 uger, men som lønmodtager kræver det en aftale med arbejdsgiveren (§ 7, stk. 3).",
            foraelder: f.id,
          });
        }
      }
    }

    if (a.tabteOeremaerkede > EPS) {
      const oe = a.forbrug.find((b) => b.spand.id === "oeremaerket" && b.rest > EPS);
      if (oe) {
        beskeder.push({
          id: `oeremaerket-${f.id}`,
          niveau: "advarsel",
          titel: `${navn} har ${uger(oe.rest)} øremærket orlov, der går tabt`,
          tekst: `De 9 øremærkede uger kan ikke overdrages og skal holdes, inden barnet fylder 1 år. Læg dem ind i kalenderen, ellers bortfalder de (barselsloven § 21, stk. 3).`,
          foraelder: f.id,
        });
      }
    }

    if (a.udenRet > EPS) {
      beskeder.push({
        id: `udenret-${f.id}`,
        niveau: "fejl",
        titel: `${uger(a.udenRet)} af ${navn}s orlov er uden barselsdagpenge`,
        tekst:
          "Der er planlagt mere orlov, end der er uger med barselsdagpenge til, eller uger ligger uden for den periode, hvor de må holdes. Du kan godt have ret til fravær, men uden dagpenge (og ofte uden løn). Flyt eller fjern ugerne, eller overfør flere uger fra den anden forælder.",
        foraelder: f.id,
      });
    }

    const efterFrist = [...a.uger.values()].filter(
      (u) => u.uge >= a.frist && u.andel > 0 && (u.fordeling["uden-ret"] ?? 0) < u.andel - EPS
    );
    if (efterFrist.length > 0) {
      beskeder.push({
        id: `frist-${f.id}`,
        niveau: "advarsel",
        titel: `${navn} har orlov efter fristen`,
        tekst:
          "Barselsdagpenge efter uge 10 skal som udgangspunkt bruges, inden barnet fylder 1 år. Orlov senere end det kræver udskudt orlov (varsles særskilt) eller forlængelse ved delvis genoptagelse.",
        foraelder: f.id,
      });
    }

    if (a.udskudt > 0 || f.udskudteUger > 0) {
      if (f.beskaeftigelse !== "loenmodtager") {
        beskeder.push({
          id: `udskudt-type-${f.id}`,
          niveau: "advarsel",
          titel: "Udskudt orlov er en lønmodtagerret",
          tekst: "Retten til at udskyde op til 5 uger gælder beskæftigede lønmodtagere (barselsloven § 11).",
          foraelder: f.id,
        });
      } else if (f.udskudteUger > REGLER.udskydRetUger) {
        beskeder.push({
          id: `udskudt-aftale-${f.id}`,
          niveau: "info",
          titel: `Mere end ${REGLER.udskydRetUger} udskudte uger kræver aftale`,
          tekst: `Du har ret til at udskyde op til ${REGLER.udskydRetUger} uger. Flere uger kræver en aftale med arbejdsgiveren. Udskudt orlov skal holdes, inden barnet fylder ${REGLER.udskydSenestAar} år (§§ 11-12).`,
          foraelder: f.id,
        });
      }
      if (a.udskudt + EPS < f.udskudteUger) {
        beskeder.push({
          id: `udskudt-max-${f.id}`,
          niveau: "advarsel",
          titel: "Ikke nok delbare uger at udskyde",
          tekst: `Kun ${uger(a.udskudt)} kan reserveres som udskudt orlov, fordi øremærkede uger skal holdes inden barnet fylder 1 år.`,
          foraelder: f.id,
        });
      }
    }

    if (ret.rolle === "naertstaaende" && a.modtaget > 0) {
      beskeder.push({
        id: `naert-${f.id}`,
        niveau: "info",
        titel: `${navn} holder ${uger(a.modtaget)} overdraget orlov`,
        tekst:
          "En soloforælder kan overdrage sine ikke-øremærkede uger til sine forældre eller søskende over 18 år. Den nærtstående skal selv opfylde beskæftigelseskravet og varsle sin arbejdsgiver 8 uger før (§ 23 c).",
        foraelder: f.id,
      });
    }

    const tidligOverfoert = analyser
      .filter((o) => o.id !== f.id)
      .some((o) => o.forbrug.some((b) => b.spand.id === "tidlig" && b.afgivet > EPS));
    if (ret.rolle === "partner" && tidligOverfoert) {
      beskeder.push({
        id: `7a-${f.id}`,
        niveau: "info",
        titel: "Mors uger fra de første 10 uger er overdraget",
        tekst:
          "Mor kan overdrage op til 8 af sine uger 3-10, hvis hun går tilbage på fuld tid eller i stedet starter sin forældreorlov. Det skal varsles senest 4 uger før forventet fødsel (§ 7 a og § 15, stk. 1).",
        foraelder: f.id,
      });
    }

    if (a.ubrugteDelbare > 0.5 && a.rettigheder.rolle !== "naertstaaende") {
      beskeder.push({
        id: `ubrugte-${f.id}`,
        niveau: "info",
        titel: `${navn} har ${uger(a.ubrugteDelbare)} med dagpenge, der ikke er planlagt`,
        tekst:
          analyser.length === 2
            ? "Ugerne kan holdes af dig selv eller (de delbare) overføres til den anden. De udløber, når barnet fylder 1 år."
            : "Ugerne udløber, hvis de ikke bruges inden fristen.",
        foraelder: f.id,
      });
    }

    if (f.beskaeftigelse === "studerende") {
      beskeder.push({
        id: `su-${f.id}`,
        niveau: "info",
        titel: `${navn} er studerende`,
        tekst:
          "SU giver ikke ret til barselsdagpenge. I stedet kan du få fødsels-støtte fra SU i op til 9 måneder (12 som enlig forsørger) og evt. forsørgertillæg. Har du studiejob, kan du have ret til barselsdagpenge. Beregningen bruger det SU-beløb, du har indtastet.",
        foraelder: f.id,
      });
    }
    if (f.beskaeftigelse === "selvstaendig") {
      beskeder.push({
        id: `selvst-${f.id}`,
        niveau: "info",
        titel: `${navn} er selvstændig`,
        tekst:
          "Satsen beregnes af overskuddet (fuld sats kræver ca. 264.420 kr. om året i 2026). Du kan arbejde op til 3,5 timer om ugen uden at miste dagpenge, og de 9 uger er ikke øremærkede for selvstændige.",
        foraelder: f.id,
      });
    }
  });

  // Overlap: both at home on leave the same week.
  let faelles = 0;
  if (analyser.length === 2) {
    for (const [w, u] of analyser[0].uger) {
      const other = analyser[1].uger.get(w);
      if (w >= 0 && u.andel > 0 && other && other.andel > 0) faelles += Math.min(u.andel, other.andel);
    }
    if (faelles > 0) {
      beskeder.push({
        id: "faelles",
        niveau: "info",
        titel: `I er hjemme sammen i ${uger(faelles)}`,
        tekst:
          "Det er tilladt at holde orlov samtidig. Husk, at uger holdt samtidig bruger af begges uger, så barnet samlet får færre uger med en forælder hjemme.",
      });
    }
  }

  if (plan.indlaeggelsesUger > 0 && plan.dato < REGLER.indlaeggelseNyRegelFra) {
    beskeder.push({
      id: "indlaeggelse-gammel",
      niveau: "info",
      titel: "Forlængelse ved indlæggelse er begrænset",
      tekst: "For børn født før 1. januar 2026 kan orloven højst forlænges med 3 måneder ved indlæggelse.",
    });
  }

  if (solo && plan.foraeldre[0]) {
    beskeder.push({
      id: "solo",
      niveau: "info",
      titel: "Soloforælder: 22 ekstra uger",
      tekst: adoption
        ? "Som eneadoptant har du 22 ekstra uger med barselsdagpenge, i alt 46 uger efter modtagelsen (§ 21 c)."
        : "Har barnet kun én juridisk forælder, er der 22 ekstra uger med barselsdagpenge, i alt 46 uger efter fødslen. De ikke-øremærkede uger kan overdrages til dine forældre eller søskende over 18 år (§ 21 c og § 23 c).",
    });
  }

  const alle = analyser.flatMap((a) => [...a.uger.values()].filter((u) => u.celle));
  const foersteUge = Math.min(-4, ...alle.map((u) => u.uge));
  const sidsteUge = Math.max(
    REGLER.fristUger,
    ...alle.map((u) => u.uge + 1),
    ...analyser.map((a) => (a.sidsteUge ?? 0) + 1)
  );

  const orden: Record<Niveau, number> = { fejl: 0, advarsel: 1, info: 2 };
  beskeder.sort((x, y) => orden[x.niveau] - orden[y.niveau]);

  return {
    anker,
    foraeldre: analyser,
    beskeder,
    varsler: beregnVarsler(plan, analyser, idag),
    faellesUger: faelles,
    foersteUge,
    sidsteUge,
  };
}

function deltidsBuffer(deltid: number, s: Spand): number {
  // Part-time work extends the period in which the weeks may be used (§ 12, stk. 2; § 23, stk. 1).
  return s.til >= REGLER.fristUger ? deltid : 0;
}

/** Notice deadlines towards the employer (barselsloven §§ 15-16, 23 c) and Udbetaling Danmark (§ 30). */
export function beregnVarsler(plan: BarselsPlan, analyser: ForaelderAnalyse[], _idag?: string): Varsel[] {
  const varsler: Varsel[] = [];
  const anker = plan.dato;
  const adoption = erAdoption(plan.konstellation);
  const kilde = REGLER.kilde;

  plan.foraeldre.forEach((f, index) => {
    const a = analyser[index];
    if (!a) return;
    const rolle = a.rettigheder.rolle;
    const harOrlov = a.foersteUge !== null;

    if (rolle === "naertstaaende") {
      if (harOrlov && a.foersteUge !== null) {
        varsler.push({
          foraelder: f.id,
          dato: addDays(weekStart(anker, a.foersteUge), -7 * REGLER.varselNaertstaaendeUger),
          titel: "Varsl arbejdsgiveren om overdraget orlov",
          tekst: `Senest ${REGLER.varselNaertstaaendeUger} uger før orloven starter (§ 23 c, stk. 3).`,
          kilde,
        });
      }
      return;
    }

    if (f.beskaeftigelse === "loenmodtager") {
      if (rolle === "foedende") {
        varsler.push({
          foraelder: f.id,
          dato: addMonths(anker, -REGLER.varselMorMaanederFoer),
          titel: "Fortæl arbejdsgiveren om graviditeten",
          tekst:
            "Senest 3 måneder før forventet fødsel: oplys terminsdatoen, og om du holder graviditetsorlov (§ 15, stk. 1). Skal du overdrage uger fra de første 10 uger, er fristen 4 uger før termin.",
          kilde,
        });
      } else if (!adoption) {
        varsler.push({
          foraelder: f.id,
          dato: addDays(anker, -7 * REGLER.varselPartnerUgerFoer),
          titel: "Varsl orloven i de første 10 uger",
          tekst:
            "Senest 4 uger før forventet fødsel: varsl, hvornår du holder dine 2 uger og eventuel anden orlov i de første 10 uger, inklusive længden (§ 15, stk. 3).",
          kilde,
        });
      } else {
        varsler.push({
          foraelder: f.id,
          dato: addDays(anker, -7 * REGLER.varselPartnerUgerFoer),
          titel: "Varsl adoptionsorloven",
          tekst:
            "Ved adoption skal fristerne så vidt muligt følges tilsvarende (§ 15, stk. 5). Giv besked, så snart du kender tidspunktet for modtagelsen.",
          kilde,
        });
      }
      const senere = [...a.uger.values()].some((u) => u.uge >= REGLER.foersteUger && u.andel > 0);
      if (senere || f.udskudteUger > 0) {
        varsler.push({
          foraelder: f.id,
          dato: addDays(anker, 7 * REGLER.varselEfterUge10UgerEfterFoedsel),
          titel: "Varsl orloven efter uge 10",
          tekst:
            "Inden 6 uger efter fødslen/modtagelsen: varsl start og længde af al orlov efter uge 10, også senere perioder og ønske om udskudt orlov (§ 15, stk. 4 og § 16, stk. 1).",
          kilde,
        });
      }
      if (f.udskudteUger > 0) {
        varsler.push({
          foraelder: f.id,
          dato: addDays(anker, 7 * REGLER.varselEfterUge10UgerEfterFoedsel),
          titel: "Når du holder den udskudte orlov",
          tekst: `Varsl ${f.udskudteUger <= REGLER.udskydRetUger ? REGLER.varselUdskudtKort : REGLER.varselUdskudtLang} uger før, du vil holde de udskudte uger (§ 16, stk. 2). De skal holdes, inden barnet fylder ${REGLER.udskydSenestAar} år.`,
          kilde,
        });
      }
    }

    if (harOrlov) {
      varsler.push({
        foraelder: f.id,
        dato: addDays(anker, 7 * REGLER.ansoegningsfristUger),
        titel: "Søg barselsdagpenge",
        tekst:
          f.beskaeftigelse === "studerende"
            ? "Søg fødsels-støtte hos SU (su.dk). Har du studiejob, kan du også søge barselsdagpenge."
            : `Senest ${REGLER.ansoegningsfristUger} uger efter fødslen eller første fraværsdag i en senere periode. Får du løn under orloven, er fristen ${REGLER.ansoegningsfristUger} uger efter, at lønnen stopper (§ 30). Søges via Udbetaling Danmark / Min barsel.`,
        kilde,
      });
    }
  });

  return varsler.sort((x, y) => (x.dato < y.dato ? -1 : x.dato > y.dato ? 1 : 0));
}

/** Contiguous blocks per parent, for the employer message, print and .ics. */
export interface Blok {
  start: number;
  slut: number;
  type: "graviditet" | "orlov" | "deltid" | "ferie";
  arbejdsProcent?: number;
  fase: "foer" | "tidlig" | "senere";
  fra: string;
  til: string;
}

export function blokke(plan: BarselsPlan, a: ForaelderAnalyse): Blok[] {
  const result: Blok[] = [];
  const weeks = [...a.uger.values()].filter((u) => u.celle).sort((x, y) => x.uge - y.uge);
  for (const u of weeks) {
    const c = u.celle!;
    const fase: Blok["fase"] = u.uge < 0 ? "foer" : u.uge < REGLER.foersteUger ? "tidlig" : "senere";
    const type: Blok["type"] = c.type === "orlov" && u.uge < 0 && a.rettigheder.rolle === "foedende" ? "graviditet" : c.type;
    const last = result[result.length - 1];
    if (
      last &&
      last.slut === u.uge &&
      last.type === type &&
      last.fase === fase &&
      (last.arbejdsProcent ?? 0) === (c.arbejdsProcent ?? 0)
    ) {
      last.slut = u.uge + 1;
      last.til = weekEnd(plan.dato, u.uge);
    } else {
      result.push({
        start: u.uge,
        slut: u.uge + 1,
        type,
        fase,
        ...(c.type === "deltid" ? { arbejdsProcent: c.arbejdsProcent } : {}),
        fra: weekStart(plan.dato, u.uge),
        til: weekEnd(plan.dato, u.uge),
      });
    }
  }
  return result;
}

export function blokBeskrivelse(b: Blok, adoption: boolean): string {
  const n = b.slut - b.start;
  const længde = `${n} ${n === 1 ? "uge" : "uger"}`;
  switch (b.type) {
    case "graviditet":
      return `Graviditetsorlov (${længde})`;
    case "ferie":
      return `Ferie (${længde})`;
    case "deltid":
      return `Orlov på deltid – arbejder ${b.arbejdsProcent} % (${længde})`;
    case "orlov":
      if (b.fase === "foer") return `Orlov før modtagelsen (${længde})`;
      if (b.fase === "tidlig")
        return `Barselsorlov i de første 10 uger efter ${adoption ? "modtagelsen" : "fødslen"} (${længde})`;
      return `Forældreorlov (${længde})`;
  }
}

export function formatVarselDato(iso: string): string {
  return formatDato(iso);
}
