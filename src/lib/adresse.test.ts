import { describe, expect, it, vi } from "vitest";
import { hentAdressePunkt, parseAdressePunkt, parseSoegning, soegAdresser } from "./adresse";
import adresseKbh from "./__fixtures__/adressevaelger-adresse-kbh.json";
import husnummerAarhus from "./__fixtures__/adressevaelger-husnummer-aarhus.json";
// Recorded responses from adressevaelger.dk/adresser/soeg on 25 Sep 2026.
import soegAdresse from "./__fixtures__/bbr/adressevaelger-soeg-adresse.json";
import soegVejpostnr from "./__fixtures__/bbr/adressevaelger-soeg-vejpostnr.json";
import soegVejnavn from "./__fixtures__/bbr/adressevaelger-soeg-vejnavn.json";
import soegHusnummer from "./__fixtures__/bbr/adressevaelger-soeg-husnummer.json";
import soegLejligheder from "./__fixtures__/bbr/adressevaelger-soeg-lejligheder.json";

describe("parseSoegning (Adressevælger /adresser/soeg)", () => {
  it("gives a specific address for Vejers Havvej 5", () => {
    expect(parseSoegning(soegAdresse)).toEqual([
      {
        type: "adresse",
        id: "0a3f50b8-9a04-32b8-e044-0003ba298018",
        titel: "Vejers Havvej 5, 6853 Vejers Strand",
        husnummerId: "0a3f508d-40c5-32b8-e044-0003ba298018",
      },
    ]);
  });

  it("turns road+postcode into a refined search with the caret after the road name", () => {
    const f = parseSoegning(soegVejpostnr).find((x) => x.titel === "Vejers Havvej 6853 Vejers Strand");
    expect(f).toMatchObject({ type: "fortsaet", kilde: "navngivenvejpostnummer" });
    if (!f || f.type !== "fortsaet") throw new Error("missing");
    expect(f.naesteTekst).toBe("Vejers Havvej , 6853 Vejers Strand");
    expect(f.naesteTekst.slice(0, f.markoer)).toBe("Vejers Havvej ");
  });

  it("turns a road name into a refined search", () => {
    const f = parseSoegning(soegVejnavn).find((x) => x.titel === "Vestergade");
    expect(f).toMatchObject({ type: "fortsaet", kilde: "vejnavn", naesteTekst: "Vestergade ", markoer: 11 });
  });

  it("handles mixed house-number and address results", () => {
    const r = parseSoegning(soegHusnummer);
    expect(
      r.some((x) => x.type === "fortsaet" && x.kilde === "husnummer" && x.naesteTekst === "Nørrebrogade 20, 2200 København N"),
    ).toBe(true);
    expect(r.some((x) => x.type === "adresse" && x.titel === "Nørrebrogade 20, 4930 Maribo")).toBe(true);
  });

  it("lists the floors when searching further on an entrance", () => {
    expect(parseSoegning(soegLejligheder).map((x) => x.titel)).toContain("Nørrebrogade 20, 2., 2200 København N");
  });

  it("tolerates empty and odd answers", () => {
    expect(parseSoegning(null)).toEqual([]);
    expect(parseSoegning({ status: "ok", fund: [] })).toEqual([]);
    expect(parseSoegning({ fund: [{ type: "adresse" }, { type: "ukendt", titel: "x" }, "x"] })).toEqual([]);
  });
});

describe("soegAdresser", () => {
  it("sends the token and url-encodes æøå", async () => {
    const fetchImpl = vi.fn(async (_url: string) => new Response(JSON.stringify(soegAdresse)));
    const r = await soegAdresser("Nørrebrogade 220", { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toHaveLength(1);
    const url = new URL(fetchImpl.mock.calls[0][0]);
    expect(url.origin).toBe("https://adressevaelger.dk");
    expect(url.pathname).toBe("/adresser/soeg");
    expect(url.searchParams.get("tekst")).toBe("Nørrebrogade 220");
    expect(url.searchParams.get("token")).toBe("adressevaelger123");
  });

  it("does not search on fewer than two characters", async () => {
    const fetchImpl = vi.fn();
    expect(await soegAdresser(" r ", { fetchImpl })).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("throws when Adressevælger fails, so the field can show a message", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 503 }));
    await expect(soegAdresser("Vejers", { fetchImpl: fetchImpl as unknown as typeof fetch })).rejects.toThrow("503");
  });
});

describe("husnummer-id på opgange (til ruteafstand)", () => {
  it("keeps the house number id on an entrance suggestion", () => {
    const f = parseSoegning(soegHusnummer).find((x) => x.type === "fortsaet" && x.kilde === "husnummer");
    expect(f).toMatchObject({ husnummerId: "0a3f507a-d058-32b8-e044-0003ba298018" });
  });
});

describe("parseAdressePunkt", () => {
  it("converts the access point of /husnumre/{id} from EPSG:25832 to WGS84", () => {
    const p = parseAdressePunkt(husnummerAarhus);
    expect(p?.betegnelse).toBe("Rådhuspladsen 2, 8000 Aarhus C");
    expect(p?.lat).toBeCloseTo(56.15263, 5);
    expect(p?.lon).toBeCloseTo(10.20321, 5);
  });

  it("reads adresse.husnummer from /adresser/{id}", () => {
    const p = parseAdressePunkt(adresseKbh);
    expect(p?.husnummerId).toBe("0a3f507a-ec01-32b8-e044-0003ba298018");
    expect(p?.lat).toBeCloseTo(55.67563, 5);
    expect(p?.lon).toBeCloseTo(12.56958, 5);
  });

  it("rejects missing or implausible coordinates", () => {
    expect(parseAdressePunkt({ husnummer: { id_lokalid: "x", adgangsadressebetegnelse: "y" } })).toBeNull();
    expect(
      parseAdressePunkt({
        husnummer: { id_lokalid: "x", adgangsadressebetegnelse: "y", adgangspunkt: { koordinater: { x: 12.5, y: 55.6 } } },
      }),
    ).toBeNull();
    expect(parseAdressePunkt("nope")).toBeNull();
  });
});

describe("hentAdressePunkt", () => {
  it("uses /husnumre/{husnummerId} when known, otherwise /adresser/{id}", async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      new Response(JSON.stringify(url.includes("/husnumre/") ? husnummerAarhus : adresseKbh)),
    );
    const f = fetchImpl as unknown as typeof fetch;
    expect((await hentAdressePunkt({ id: "a", husnummerId: "h1" }, { fetchImpl: f }))?.betegnelse).toBe(
      "Rådhuspladsen 2, 8000 Aarhus C",
    );
    expect(new URL(fetchImpl.mock.calls[0][0]).pathname).toBe("/husnumre/h1");
    await hentAdressePunkt({ id: "a2", husnummerId: null }, { fetchImpl: f });
    expect(new URL(fetchImpl.mock.calls[1][0]).pathname).toBe("/adresser/a2");
    expect(fetchImpl.mock.calls.every(([u]) => !u.includes("dataforsyningen"))).toBe(true);
  });
});
