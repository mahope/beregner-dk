import type { Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

/**
 * Markedspriser for freelancere, grupperet efter fag.
 *
 * Tallene lå håndskrevet i `TimeprisBeregner.tsx` — 27 beløb i
 * strengliteraler, og **de samme tal i alle tre sprog**, mens overskriften
 * sagde «Typiske timepriser i Norge (2026)» og «Typiska timpriser i Sverige
 * (2026)». Svensk og norsk læser fik dermed danske niveauer under en
 * påstand om sit eget marked, og sidens egen FAQ modsagde samme panel:
 * den skrev «IT: 900-1.800 SEK/timme» og «Håndværkere: 500-800 SEK/timme»,
 * mens panelet viste 900-1.500 og 400-600.
 *
 * Der er ingen kilde i repoet på svensk eller norsk frilanstimepris, så der
 * opfindes ingen her (punkt 11). Modulet siger derfor *hvad tallene er*:
 * `omraade` er «danmark» på alle tre domæner, og på de svenske og norske
 * overskrift og note står det, at tabellen er dansk. `MARKEDSPRISER_ER_DANSKE`
 * er sand for `se` og `no`, og porten dømmer på den.
 *
 * FAQ-svaret på «normal konsulent-timepris» læses fra samme modul, så de to
 * steder ikke kan glide fra hinanden igen.
 */

export type MarkedsprisGruppeId = "it" | "kreativ" | "raadgivning" | "haandvaerk";

export type MarkedsprisPostId =
  | "juniorUdvikler"
  | "seniorUdvikler"
  | "itKonsulent"
  | "grafiskDesigner"
  | "tekstforfatter"
  | "marketingKonsulent"
  | "konsulent"
  | "advokat"
  | "revisor"
  | "haandvaerker"
  | "fotograf"
  | "underviser";

export interface MarkedsprisPost {
  id: MarkedsprisPostId;
  min: number;
  max: number;
}

export interface MarkedsprisGruppe {
  id: MarkedsprisGruppeId;
  poster: MarkedsprisPost[];
}

/**
 * Hvilket marked tallene gælder. Kun «danmark» er underbygget af en kilde,
 * så det er også det, `omraade` siger på de andre to domæner.
 */
export type MarkedsprisOmraade = "danmark";

/** De danske niveauer. Samme tal på alle tre domæner — se docblocken. */
export const DANSKE_MARKEDSPRISER: MarkedsprisGruppe[] = [
  {
    id: "it",
    poster: [
      { id: "juniorUdvikler", min: 500, max: 700 },
      { id: "seniorUdvikler", min: 800, max: 1200 },
      { id: "itKonsulent", min: 900, max: 1500 },
    ],
  },
  {
    id: "kreativ",
    poster: [
      { id: "grafiskDesigner", min: 500, max: 800 },
      { id: "tekstforfatter", min: 600, max: 1000 },
      { id: "marketingKonsulent", min: 700, max: 1200 },
    ],
  },
  {
    id: "raadgivning",
    poster: [
      { id: "konsulent", min: 800, max: 1500 },
      { id: "advokat", min: 1500, max: 3500 },
      { id: "revisor", min: 900, max: 1800 },
    ],
  },
  {
    id: "haandvaerk",
    poster: [
      { id: "haandvaerker", min: 400, max: 600 },
      { id: "fotograf", min: 500, max: 1500 },
      { id: "underviser", min: 500, max: 1000 },
    ],
  },
];

/**
 * Kun `da` får tallene skrevet som «kr» i dansk skrivemåde; `se` og `no` får
 * dem med landekoden, fordi «kr» i svensk og norsk læses som sin egen valuta.
 */
export function formaterMarkedspris(post: MarkedsprisPost, locale: Locale): string {
  const min = formatNumber(post.min, "da");
  const max = formatNumber(post.max, "da");
  return locale === "da" ? `${min}-${max} kr` : `${min}–${max} DKK`;
}

/** Gruppenavne. De ligger ved siden af de tal, de hører til. */
export const GRUPPE_ETIKETTER: Record<MarkedsprisGruppeId, Record<Locale, string>> = {
  it: { da: "IT & Udvikling", se: "IT & Utveckling", no: "IT & Utvikling" },
  kreativ: {
    da: "Kreativ & Marketing",
    se: "Kreativt & Marknadsföring",
    no: "Kreativt & Markedsføring",
  },
  raadgivning: { da: "Rådgivning", se: "Rådgivning", no: "Rådgivning" },
  haandvaerk: {
    da: "Håndværk & Service",
    se: "Hantverk & Service",
    no: "Håndverk & Service",
  },
};

/** Postnavne. Samme opdeling på alle tre domæner, kun oversat. */
export const POST_ETIKETTER: Record<MarkedsprisPostId, Record<Locale, string>> = {
  juniorUdvikler: { da: "Junior udvikler", se: "Juniorutvecklare", no: "Juniorutvikler" },
  seniorUdvikler: { da: "Senior udvikler", se: "Seniorutvecklare", no: "Seniorutvikler" },
  itKonsulent: { da: "IT-konsulent", se: "IT-konsult", no: "IT-konsulent" },
  grafiskDesigner: { da: "Grafisk designer", se: "Grafisk designer", no: "Grafisk designer" },
  tekstforfatter: { da: "Tekstforfatter", se: "Copywriter", no: "Tekstforfatter" },
  marketingKonsulent: {
    da: "Marketing konsulent",
    se: "Marknadsföringskonsult",
    no: "Markedsføringskonsulent",
  },
  konsulent: { da: "Konsulent", se: "Konsult", no: "Konsulent" },
  advokat: { da: "Advokat", se: "Advokat", no: "Advokat" },
  revisor: { da: "Revisor", se: "Revisor", no: "Revisor" },
  haandvaerker: { da: "Håndværkere", se: "Hantverkare", no: "Håndverkere" },
  fotograf: { da: "Fotograf", se: "Fotograf", no: "Fotograf" },
  underviser: { da: "Underviser", se: "Lärare", no: "Underviser" },
};

/** Markedspriserne for et domæne. Samme tal alle steder — se docblocken. */
export function markedspriser(locale: Locale): MarkedsprisGruppe[] {
  return DANSKE_MARKEDSPRISER;
}

/** Sand på de domæner, hvor tallene *ikke* er det lokale marked. */
export function markedspriserErDanske(locale: Locale): boolean {
  return locale !== "da";
}

export function markedsprisOmraade(): MarkedsprisOmraade {
  return "danmark";
}

/** Én post som et interval — bruges af FAQ'en og af porten. */
export function findMarkedspris(
  gruppeId: MarkedsprisGruppeId,
  postId: MarkedsprisPostId
): MarkedsprisPost {
  const gruppe = DANSKE_MARKEDSPRISER.find((g) => g.id === gruppeId);
  const post = gruppe?.poster.find((p) => p.id === postId);
  if (!post) throw new Error(`Ukendt markedspris: ${gruppeId}/${postId}`);
  return post;
}

/**
 * FAQ-svaret på «normal konsulent-timepris», læst fra tabellen.
 *
 * Det skrev «IT: 800-1.500 DKK/time» i dansk, mens panelet viste
 * `itKonsulent` 900-1.500, og på svensk og norsk skrev det «900-1.800
 * SEK/timme» og «900-1.800 NOK/time» — tal, der stod ingen steder i koden.
 */
export function markedsprisFaqSvar(locale: Locale): string {
  const it = formaterMarkedspris(findMarkedspris("it", "itKonsulent"), locale);
  const haandvaerk = formaterMarkedspris(findMarkedspris("haandvaerk", "haandvaerker"), locale);
  if (locale === "da") return `IT: ${it}/time. Håndværkere: ${haandvaerk}/time.`;
  if (locale === "se") return `Dansk nivå: IT ${it}/timme, hantverkare ${haandvaerk}/timme.`;
  return `Dansk nivå: IT ${it}/time, håndverkere ${haandvaerk}/time.`;
}