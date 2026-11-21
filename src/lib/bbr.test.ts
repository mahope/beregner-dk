import { describe, expect, it, vi } from "vitest";
import {
  anvendelsesTekst,
  erUuid,
  hentBbr,
  parseBygninger,
  parseEnheder,
  parseJordstykkeAreal,
  udledBbr,
} from "./bbr";
import { lavRateLimit } from "./rate-limit";
// Recorded responses from graphql.datafordeler.dk (BBR/v2, MAT/v2) on 25 Sep 2026, without apiKey.
import bygHus from "./__fixtures__/bbr/bbr-bygninger-hus.json"; // Vejers Havvej 5, 6853 Vejers Strand
import enhHus from "./__fixtures__/bbr/bbr-enheder-hus.json";
import matHus from "./__fixtures__/bbr/mat-jordstykke-hus.json";
import bygEjl from "./__fixtures__/bbr/bbr-bygninger-ejerlejlighed.json"; // Nørrebrogade 220, 2. th, 2200 København N
import enhEjl from "./__fixtures__/bbr/bbr-enheder-ejerlejlighed.json";
import bygSommerhus from "./__fixtures__/bbr/bbr-bygninger-sommerhus.json"; // Lyngvej 1, 9492 Blokhus
import enhSommerhus from "./__fixtures__/bbr/bbr-enheder-sommerhus.json";
import bygRaadhus from "./__fixtures__/bbr/bbr-bygninger-raadhus.json"; // Rådhuspladsen 1, 1550 København V

const byg = (j: unknown) => parseBygninger(j) ?? [];
const enh = (j: unknown) => parseEnheder(j) ?? [];

describe("parseBygninger", () => {
  it("keeps only current buildings (status 6/7)", () => {
    const b = byg(bygSommerhus);
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ anvendelse: "510", opfoerelsesaar: 2022, boligareal: 113 });
  });

  it("reads the land parcel id and leaves garages without area as null", () => {
    const b = byg(bygHus);
    expect(b.find((x) => x.anvendelse === "120")).toMatchObject({ jordstykke: "1427068", boligareal: 195 });
    expect(b.find((x) => x.anvendelse === "910")).toMatchObject({ opfoerelsesaar: 2001, boligareal: null, samletAreal: null });
  });

  it("drops demolished versions (status 9) of the apartment building", () => {
    expect(byg(bygEjl)).toHaveLength(1);
  });

  it("returns null on GraphQL errors", () => {
    expect(parseBygninger({ errors: [{ message: "nope" }] })).toBeNull();
    expect(parseBygninger(null)).toBeNull();
  });
});

describe("parseEnheder", () => {
  it("reads rooms and skips units with status 9", () => {
    expect(enh(enhEjl)).toEqual([expect.objectContaining({ anvendelse: "140", boligareal: 136, vaerelser: 4 })]);
    expect(enh(enhHus)[0]).toMatchObject({ anvendelse: "120", boligareal: 195, vaerelser: 6 });
  });
});

describe("parseJordstykkeAreal", () => {
  it("reads the registered plot area", () => {
    expect(parseJordstykkeAreal(matHus)).toBe(1663);
  });

  it("ignores retired parcels and malformed answers", () => {
    expect(
      parseJordstykkeAreal({
        data: {
          MAT_Jordstykke: {
            nodes: [{ status: "Historisk", registreretAreal: 500, virkningTil: null, registreringTil: null }],
          },
        },
      }),
    ).toBeNull();
    expect(parseJordstykkeAreal({ errors: [] })).toBeNull();
  });
});

describe("udledBbr", () => {
  it("house: unit area, rooms, construction year and parcel; the garage does not count", () => {
    expect(udledBbr(byg(bygHus), enh(enhHus))).toEqual({
      data: {
        boligareal: 195,
        vaerelser: 6,
        opfoerelsesaar: 2000,
        ombygningsaar: null,
        grundareal: null,
        anvendelseKode: "120",
        anvendelse: "Fritliggende enfamiliehus",
        lejlighed: false,
      },
      jordstykke: "1427068",
    });
  });

  it("house without unit lookup: the dwelling building's area, no rooms", () => {
    expect(udledBbr(byg(bygHus))).toMatchObject({
      data: { boligareal: 195, vaerelser: null, lejlighed: false },
      jordstykke: "1427068",
    });
  });

  it("apartment: the unit's area, not the whole building's, and no plot area", () => {
    expect(udledBbr(byg(bygEjl), enh(enhEjl))).toEqual({
      data: {
        boligareal: 136,
        vaerelser: 4,
        opfoerelsesaar: 1905,
        ombygningsaar: null,
        grundareal: null,
        anvendelseKode: "140",
        anvendelse: "Bolig i etageejendom, flerfamiliehus eller tofamiliehus",
        lejlighed: true,
      },
      jordstykke: null,
    });
  });

  it("apartment building without a specific unit: no area (the building's area is all apartments)", () => {
    expect(udledBbr(byg(bygEjl))).toMatchObject({
      data: { boligareal: null, opfoerelsesaar: 1905, lejlighed: true },
      jordstykke: null,
    });
  });

  it("summer house: historic versions are ignored", () => {
    expect(udledBbr(byg(bygSommerhus), enh(enhSommerhus))?.data).toMatchObject({
      boligareal: 113,
      opfoerelsesaar: 2022,
      anvendelse: "Sommerhus",
      lejlighed: false,
    });
  });

  it("office building (Copenhagen City Hall): no dwelling", () => {
    expect(udledBbr(byg(bygRaadhus), [])).toBeNull();
  });

  it("skips versions with an end date even if status is 6", () => {
    const b = parseBygninger({
      data: {
        BBR_Bygning: {
          nodes: [
            { id_lokalId: "a", status: "6", byg021BygningensAnvendelse: "120", virkningTil: "2020-01-01T00:00:00Z", registreringTil: null },
          ],
        },
      },
    });
    expect(b).toEqual([]);
  });

  it("uses the conversion year only when later than construction and rejects odd parcel ids", () => {
    const b = parseBygninger({
      data: {
        BBR_Bygning: {
          nodes: [
            {
              id_lokalId: "a",
              status: "6",
              byg021BygningensAnvendelse: "510",
              byg026Opfoerelsesaar: 1964,
              byg027OmTilbygningsaar: 1975,
              byg039BygningensSamledeBoligAreal: 63,
              jordstykke: "x; drop",
              virkningTil: null,
              registreringTil: null,
            },
            { id_lokalId: "b", status: "6", byg021BygningensAnvendelse: "930", byg026Opfoerelsesaar: 1000, virkningTil: null, registreringTil: null },
          ],
        },
      },
    })!;
    expect(udledBbr(b)).toMatchObject({
      data: { opfoerelsesaar: 1964, ombygningsaar: 1975, boligareal: 63 },
      jordstykke: null,
    });
  });
});

describe("code list and helpers", () => {
  it("translates use codes to Danish", () => {
    expect(anvendelsesTekst("120")).toBe("Fritliggende enfamiliehus");
    expect(anvendelsesTekst("140", true)).toBe("Bolig i etageejendom, flerfamiliehus eller tofamiliehus");
    expect(anvendelsesTekst("777")).toBe("Anvendelseskode 777");
    expect(anvendelsesTekst(null)).toBeNull();
  });

  it("validates uuids", () => {
    expect(erUuid("0a3f507a-d124-32b8-e044-0003ba298018")).toBe(true);
    expect(erUuid("0a3f507a-d124-32b8-e044-0003ba29801")).toBe(false);
    expect(erUuid("x; drop table")).toBe(false);
    expect(erUuid(null)).toBe(false);
  });

  it("rate limit: 30 per minute per key", () => {
    const rl = lavRateLimit(30);
    for (let i = 0; i < 30; i++) expect(rl.tilladt("1.2.3.4", 0)).toBe(true);
    expect(rl.tilladt("1.2.3.4", 1000)).toBe(false);
    expect(rl.tilladt("5.6.7.8", 1000)).toBe(true);
    expect(rl.tilladt("1.2.3.4", 60_000)).toBe(true);
  });
});

describe("hentBbr (client)", () => {
  const ID = "0a3f507a-d124-32b8-e044-0003ba298018";

  it("POSTs the ids in the body (not the URL) to our own route", async () => {
    const fetchImpl = vi.fn(
      async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ tilgaengelig: true, fundet: false })),
    );
    const r = await hentBbr(ID, null, { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ tilgaengelig: true, fundet: false });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/bbr");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ husnummerId: ID, adresseId: null });
  });

  it("degrades to tilgaengelig:false on network errors and non-2xx", async () => {
    const kaster = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await hentBbr(ID, null, { fetchImpl: kaster as unknown as typeof fetch })).toEqual({ tilgaengelig: false });
    const fejl = vi.fn(async () => new Response("", { status: 429 }));
    expect(await hentBbr(ID, null, { fetchImpl: fejl as unknown as typeof fetch })).toEqual({ tilgaengelig: false });
  });
});
