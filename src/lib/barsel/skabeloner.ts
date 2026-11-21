/**
 * Default plan and suggested standard plans the user can start from.
 */

import { addDays, todayIso } from "./dato";
import { KONSTELLATIONER, REGLER, erAdoption, rettigheder, rolleFor } from "./regler";
import type { BarselsPlan, Foraelder, ForaelderId, Konstellation, Periode } from "./types";

export type SkabelonId = "klassisk" | "lige" | "sammen";

export const SKABELONER: { id: SkabelonId; titel: string; beskrivelse: string }[] = [
  {
    id: "klassisk",
    titel: "Klassisk",
    beskrivelse: "Den ene holder det meste af orloven, den anden de 2 uger ved fødslen og sine øremærkede uger bagefter.",
  },
  {
    id: "lige",
    titel: "Lige deling",
    beskrivelse: "I holder hver jeres egne uger efter hinanden, så barnet har en forælder hjemme længst muligt.",
  },
  {
    id: "sammen",
    titel: "Maksimal tid sammen",
    beskrivelse: "I holder orlov samtidig fra fødslen. Mest tid sammen, men kortere samlet orlov.",
  },
];

export function nyForaelder(id: ForaelderId, navn: string): Foraelder {
  return {
    id,
    navn,
    beskaeftigelse: "loenmodtager",
    maanedsloen: 38000,
    ugentligeTimer: 37,
    loenUnderBarsel: [],
    ydelseMaaned: 0,
    udskudteUger: 0,
    perioder: [],
  };
}

export function standardPlan(idag: string = todayIso()): BarselsPlan {
  const plan: BarselsPlan = {
    konstellation: "mor-far",
    datoType: "termin",
    dato: addDays(idag, 150),
    antalBoern: 1,
    adoptionUdland: false,
    naertstaaende: false,
    indlaeggelsesUger: 0,
    kommuneskatPct: 25,
    foraeldre: [nyForaelder("a", "Mor"), nyForaelder("b", "Far")],
  };
  return anvendSkabelon(plan, "klassisk");
}

/** Change constellation: keep what makes sense, fix the number of people and names. */
export function skiftKonstellation(plan: BarselsPlan, k: Konstellation): BarselsPlan {
  const def = KONSTELLATIONER.find((x) => x.id === k)!;
  const oldDef = KONSTELLATIONER.find((x) => x.id === plan.konstellation)!;
  const antal = k === "adoption-solo" || (k === "solo" && !plan.naertstaaende) ? 1 : 2;
  const ids: ForaelderId[] = ["a", "b"];
  const foraeldre = ids.slice(0, antal).map((id, i) => {
    const eksisterende = plan.foraeldre[i];
    const standardNavn = def.roller[i] ?? `Person ${i + 1}`;
    if (!eksisterende) return nyForaelder(id, standardNavn);
    // Replace names that are still the previous constellation's default.
    const navn = eksisterende.navn === oldDef.roller[i] || !eksisterende.navn ? standardNavn : eksisterende.navn;
    return { ...eksisterende, navn };
  });
  const next: BarselsPlan = { ...plan, konstellation: k, foraeldre };
  return anvendSkabelon(next, "klassisk");
}

export function saetNaertstaaende(plan: BarselsPlan, on: boolean): BarselsPlan {
  if (plan.konstellation !== "solo") return plan;
  const foraeldre = on
    ? [plan.foraeldre[0], plan.foraeldre[1] ?? { ...nyForaelder("b", "Nærtstående") }]
    : [plan.foraeldre[0]];
  return { ...plan, naertstaaende: on, foraeldre };
}

function blok(start: number, antal: number): Periode[] {
  return antal > 0 ? [{ start, slut: start + Math.ceil(antal), type: "orlov" }] : [];
}

function sammenlaeg(perioder: Periode[]): Periode[] {
  const sorted = [...perioder].sort((a, b) => a.start - b.start);
  const out: Periode[] = [];
  for (const p of sorted) {
    const last = out[out.length - 1];
    if (last && last.type === p.type && last.slut >= p.start) last.slut = Math.max(last.slut, p.slut);
    else out.push({ ...p });
  }
  return out;
}

/**
 * Build periods for a standard plan from the entitlements, so every
 * constellation (also multiples, solo and adoption) gets a valid plan.
 */
export function anvendSkabelon(plan: BarselsPlan, id: SkabelonId): BarselsPlan {
  const ret = plan.foraeldre.map((f, i) => rettigheder(plan, f, i));
  const [a, b] = ret;
  const foer = (i: number) => (ret[i] && ret[i].foerUger > 0 ? blok(-ret[i].foerUger, ret[i].foerUger) : []);
  const egne = (i: number) => {
    const f = plan.foraeldre[i];
    return Math.max(0, ret[i].efterUger - Math.max(0, f.udskudteUger));
  };
  const perioder: Periode[][] = plan.foraeldre.map(() => []);

  if (plan.foraeldre.length === 1 || rolleFor(plan.konstellation, 1) === "naertstaaende") {
    // Solo parent (optionally with a relative who is not given weeks by default).
    perioder[0] = sammenlaeg([...foer(0), ...blok(0, egne(0))]);
    if (plan.foraeldre[1]) perioder[1] = [];
  } else {
    const aEgne = egne(0);
    const bEgne = egne(1);
    // Weeks that must be used in the first 10 weeks by B (partner/adoptant/surrogacy parent).
    const bTidlig = b.spande
      .filter((s) => s.id === "foedsel" || s.id === "tidlig-delbar")
      .reduce((sum, s) => sum + s.uger, 0);
    // Transferable weeks B could give to A.
    const bDelbar = b.spande.filter((s) => s.overdragelig && s.id !== "tidlig-delbar").reduce((s, x) => s + x.uger, 0);

    if (id === "klassisk") {
      const aTotal = aEgne + bDelbar;
      perioder[0] = sammenlaeg([...foer(0), ...blok(0, aTotal)]);
      const bRest = Math.max(0, bEgne - bDelbar - bTidlig);
      perioder[1] = sammenlaeg([...blok(0, bTidlig), ...blok(Math.max(bTidlig, Math.min(aTotal, b.frist - bRest)), bRest)]);
    } else if (id === "lige") {
      perioder[0] = sammenlaeg([...foer(0), ...blok(0, aEgne)]);
      const bRest = Math.max(0, bEgne - bTidlig);
      perioder[1] = sammenlaeg([...blok(0, bTidlig), ...blok(Math.max(bTidlig, Math.min(aEgne, b.frist - bRest)), bRest)]);
    } else {
      perioder[0] = sammenlaeg([...foer(0), ...blok(0, aEgne)]);
      perioder[1] = sammenlaeg([...(erAdoption(plan.konstellation) ? foer(1) : []), ...blok(0, bEgne)]);
    }
  }

  // Never plan benefit weeks beyond the deadline by default.
  const maks = Math.max(a.frist, REGLER.fristUger);
  return {
    ...plan,
    foraeldre: plan.foraeldre.map((f, i) => ({
      ...f,
      perioder: perioder[i].map((p) => ({ ...p, slut: Math.min(p.slut, p.start < 0 ? p.slut : maks) })).filter((p) => p.slut > p.start),
    })),
  };
}
