// Address search via Adressevælger (Klimadatastyrelsen), which replaces DAWA (closing 1 Oct 2026).
// Called directly from the browser (CORS: *). The token is for now a fixed, public string;
// user-specific tokens are expected late 2026 / early 2027.
// Docs: https://confluence.sdfi.dk/pages/viewpage.action?pageId=234782998

export const ADRESSEVAELGER_URL = "https://adressevaelger.dk";
export const ADRESSEVAELGER_TOKEN = "adressevaelger123";

/** A suggestion in the autocomplete list. */
export type Forslag =
  /** A specific address (possibly with floor/door) that can be looked up. */
  | { type: "adresse"; id: string; titel: string; husnummerId: string | null }
  /** A road, a road in a postcode or a house number with several addresses: the search must be refined. */
  | {
      type: "fortsaet";
      titel: string;
      naesteTekst: string;
      markoer: number;
      kilde: "vejnavn" | "navngivenvejpostnummer" | "husnummer";
    };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);

/** Parses the `/adresser/soeg` response. Unknown types are skipped. */
export function parseSoegning(json: unknown): Forslag[] {
  if (!isObj(json) || !Array.isArray(json.fund)) return [];
  const ud: Forslag[] = [];
  for (const f of json.fund) {
    if (!isObj(f)) continue;
    const titel = str(f.titel);
    if (!titel) continue;
    switch (f.type) {
      case "adresse": {
        const id = str(f.id);
        if (id) ud.push({ type: "adresse", id, titel, husnummerId: str(f.husnummerId) });
        break;
      }
      case "husnummer":
        // Entrance with several addresses: search again on the title so the floors are listed.
        ud.push({ type: "fortsaet", titel, naesteTekst: titel, markoer: titel.length, kilde: "husnummer" });
        break;
      case "navngivenvejpostnummer": {
        // "Vejers Havvej 6853 Vejers Strand" -> "Vejers Havvej , 6853 Vejers Strand" with the caret after
        // the road name, so the user can type the house number right away.
        const vej = str(f.vejnavn) ?? titel;
        const postnr = str(f.postnr);
        const by = str(f.postdistrikt);
        const hale = postnr ? `, ${postnr}${by ? ` ${by}` : ""}` : "";
        ud.push({ type: "fortsaet", titel, naesteTekst: `${vej} ${hale}`, markoer: vej.length + 1, kilde: "navngivenvejpostnummer" });
        break;
      }
      case "vejnavn": {
        const vej = str(f.vejNavn) ?? str(f.vejnavn) ?? titel;
        ud.push({ type: "fortsaet", titel, naesteTekst: `${vej} `, markoer: vej.length + 1, kilde: "vejnavn" });
        break;
      }
    }
  }
  return ud;
}

type HentOpts = { signal?: AbortSignal; fetchImpl?: typeof fetch };

export async function soegAdresser(tekst: string, { signal, fetchImpl = fetch }: HentOpts = {}): Promise<Forslag[]> {
  const q = tekst.trim();
  if (q.length < 2) return [];
  const url = new URL("/adresser/soeg", ADRESSEVAELGER_URL);
  url.searchParams.set("tekst", q);
  url.searchParams.set("token", ADRESSEVAELGER_TOKEN);
  const res = await fetchImpl(url.toString(), { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Adressevælger svarede ${res.status}`);
  return parseSoegning(await res.json());
}
