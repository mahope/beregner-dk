import { beforeEach, describe, expect, test, vi } from "vitest";
import osrmKbhAarhus from "./__fixtures__/osrm-kbh-aarhus.json";
import valhallaKbhAarhus from "./__fixtures__/valhalla-kbh-aarhus.json";
import valhallaUdenFaerge from "./__fixtures__/valhalla-kbh-aarhus-uden-faerge.json";
import {
  _nulstilRuteState,
  ROUTING_USER_AGENT,
  erIDanmark,
  findRute,
  parseKoordinat,
  parseOsrm,
  parseValhalla,
  valhallaUrl,
} from "./rute";

const KBH = { lat: 55.6756275, lon: 12.5695777 }; // Rådhuspladsen 1, 1550 København V
const AARHUS = { lat: 56.1526305, lon: 10.2032063 }; // Rådhuspladsen 2, 8000 Aarhus C

const svar = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("parseValhalla", () => {
  test("korteste rute (med færge) fra fixture", () => {
    expect(parseValhalla(valhallaKbhAarhus)).toEqual({ km: 182.521, faerge: true, betalingsbro: false });
  });

  test("rute uden færge over Storebælt markeres som betalingsbro", () => {
    expect(parseValhalla(valhallaUdenFaerge)).toEqual({ km: 302.528, faerge: false, betalingsbro: true });
  });

  test("fejlsvar og forkerte enheder afvises", () => {
    expect(parseValhalla({ error_code: 442, error: "No path could be found" })).toBeNull();
    expect(parseValhalla({ trip: { status: 0, units: "miles", summary: { length: 10 } } })).toBeNull();
    expect(parseValhalla({ trip: { status: 0, summary: { length: -1 } } })).toBeNull();
  });
});

describe("parseOsrm", () => {
  test("afstand i meter bliver km", () => {
    expect(parseOsrm(osrmKbhAarhus)?.km).toBeCloseTo(301.8709, 3);
  });

  test("vælger den korteste af flere alternativer", () => {
    const r = parseOsrm({ code: "Ok", routes: [{ distance: 12000 }, { distance: 9500 }, { distance: 11000 }] });
    expect(r).toEqual({ km: 9.5, faerge: null, betalingsbro: null });
  });

  test("fejlkode giver null", () => {
    expect(parseOsrm({ code: "NoRoute", routes: [] })).toBeNull();
    expect(parseOsrm({ code: "Ok", routes: [] })).toBeNull();
  });
});

describe("findRute", () => {
  beforeEach(() => _nulstilRuteState());

  test("bruger ruten uden færge og husker den kortere færgerute", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) =>
      svar(decodeURIComponent(String(url)).includes('"use_ferry":0') ? valhallaUdenFaerge : valhallaKbhAarhus),
    ) as unknown as typeof fetch;
    const r = await findRute(KBH, AARHUS, fetchImpl);
    expect(r).toEqual({ km: 302.528, faerge: false, betalingsbro: true, kmMedFaerge: 182.521, kilde: "valhalla" });
    const init = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1];
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(ROUTING_USER_AGENT);
  });

  test("falder tilbage til OSRM når Valhalla er nede, og cacher resultatet", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("valhalla") ? svar({ error: "nede" }, 503) : svar(osrmKbhAarhus),
    ) as unknown as typeof fetch;
    const r = await findRute(KBH, AARHUS, fetchImpl);
    expect(r.kilde).toBe("osrm");
    expect(r.km).toBeCloseTo(301.87, 2);
    const kald = (fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
    await findRute(KBH, AARHUS, fetchImpl);
    expect((fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(kald);
  });

  test("kaster når begge tjenester fejler", async () => {
    const fetchImpl = vi.fn(async () => svar({}, 500)) as unknown as typeof fetch;
    await expect(findRute(KBH, AARHUS, fetchImpl)).rejects.toThrow();
  });
});

describe("hjælpere", () => {
  test("valhalla-URL beder om korteste rute i km", () => {
    const u = decodeURIComponent(valhallaUrl(KBH, AARHUS));
    expect(u).toContain('"shortest":true');
    expect(u).toContain('"units":"kilometers"');
  });

  test("parseKoordinat og erIDanmark", () => {
    expect(parseKoordinat("55.67563,12.56958")).toEqual({ lat: 55.67563, lon: 12.56958 });
    expect(parseKoordinat("55.6;12.5")).toBeNull();
    expect(parseKoordinat("abc")).toBeNull();
    expect(erIDanmark(KBH)).toBe(true);
    expect(erIDanmark({ lat: 52.52, lon: 13.4 })).toBe(false);
  });
});
