import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bygHus from "@/lib/__fixtures__/bbr/bbr-bygninger-hus.json";
import enhHus from "@/lib/__fixtures__/bbr/bbr-enheder-hus.json";
import matHus from "@/lib/__fixtures__/bbr/mat-jordstykke-hus.json";
import bygEjl from "@/lib/__fixtures__/bbr/bbr-bygninger-ejerlejlighed.json";
import enhEjl from "@/lib/__fixtures__/bbr/bbr-enheder-ejerlejlighed.json";
import { POST } from "./route";

const HUS_HUSNR = "0a3f508d-40c5-32b8-e044-0003ba298018"; // Vejers Havvej 5, 6853 Vejers Strand
const HUS_ADR = "0a3f50b8-9a04-32b8-e044-0003ba298018";
const EJL_HUSNR = "0a3f507a-d124-32b8-e044-0003ba298018"; // Nørrebrogade 220, 2200 København N
const EJL_ADR = "0a3f509f-f2d2-32b8-e044-0003ba298018"; // Nørrebrogade 220, 2. th

let ip = 0;
function post(body: unknown, opts: { ip?: string; host?: string } = {}) {
  return POST(
    new NextRequest("http://localhost/api/bbr", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": opts.ip ?? `10.0.0.${++ip}`,
        host: opts.host ?? "minberegner.dk",
      },
    }),
  );
}

function mockDatafordeler(svar: { byg: unknown; enh: unknown; mat?: unknown }) {
  vi.mocked(fetch).mockImplementation(async (url, init) => {
    if (String(url).startsWith("https://graphql.datafordeler.dk/MAT/v2")) {
      return svar.mat === undefined ? new Response("nede", { status: 503 }) : new Response(JSON.stringify(svar.mat));
    }
    const query = String(JSON.parse(String(init?.body)).query);
    return new Response(JSON.stringify(query.includes("BBR_Enhed") ? svar.enh : svar.byg));
  });
}

describe("POST /api/bbr", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it.each([
    ["invalid JSON", "not json"],
    ["missing husnummerId", {}],
    ["invalid husnummerId", { husnummerId: "abc" }],
    ["url as husnummerId", { husnummerId: "https://evil.example/" }],
    ["invalid adresseId", { husnummerId: EJL_HUSNR, adresseId: "1 OR 1" }],
  ])("rejects %s with 400 without calling Datafordeler", async (_navn, body) => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("is not available on the Swedish domain", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    const res = await post({ husnummerId: EJL_HUSNR }, { host: "beraknare.se" });
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 200 { tilgaengelig: false } when the key is missing", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "");
    const res = await post({ husnummerId: EJL_HUSNR });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tilgaengelig: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 200 { tilgaengelig: false } when Datafordeler fails", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    vi.mocked(fetch).mockResolvedValue(new Response("nede", { status: 503 }));
    const res = await post({ husnummerId: EJL_HUSNR });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tilgaengelig: false });
  });

  it("apartment: unit area and rooms, no Matrikel lookup, key never in the response", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    mockDatafordeler({ byg: bygEjl, enh: enhEjl });
    const res = await post({ husnummerId: EJL_HUSNR, adresseId: EJL_ADR });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=3600");
    const data = await res.json();
    expect(data).toMatchObject({
      tilgaengelig: true,
      fundet: true,
      boligareal: 136,
      vaerelser: 4,
      opfoerelsesaar: 1905,
      grundareal: null,
      lejlighed: true,
    });
    expect(JSON.stringify(data)).not.toContain("test-noegle");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(String(vi.mocked(fetch).mock.calls[0][0]).startsWith("https://graphql.datafordeler.dk/BBR/v2?apiKey=")).toBe(true);
  });

  it("house: adds the plot area from Matrikel", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    mockDatafordeler({ byg: bygHus, enh: enhHus, mat: matHus });
    const data = await (await post({ husnummerId: HUS_HUSNR, adresseId: HUS_ADR })).json();
    expect(data).toMatchObject({
      fundet: true,
      boligareal: 195,
      vaerelser: 6,
      opfoerelsesaar: 2000,
      grundareal: 1663,
      lejlighed: false,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("house: keeps the BBR answer when Matrikel fails", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "test-noegle");
    mockDatafordeler({ byg: bygHus, enh: enhHus });
    const data = await (await post({ husnummerId: HUS_HUSNR, adresseId: HUS_ADR })).json();
    expect(data).toMatchObject({ tilgaengelig: true, fundet: true, boligareal: 195, grundareal: null });
  });

  it("rate-limits per IP (429 after 30 calls a minute)", async () => {
    vi.stubEnv("DATAFORDELER_API_KEY", "");
    for (let i = 0; i < 30; i++) {
      expect((await post({ husnummerId: EJL_HUSNR }, { ip: "192.0.2.1" })).status).toBe(200);
    }
    expect((await post({ husnummerId: EJL_HUSNR }, { ip: "192.0.2.1" })).status).toBe(429);
  });
});
