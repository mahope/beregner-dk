import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cvrradar-klient", () => ({ postTilCvrradar: vi.fn() }));

import { postTilCvrradar } from "@/lib/cvrradar-klient";
import { POST } from "./route";

const CVR = "39413892";
let n = 0;

function post(
  body: unknown,
  opts: { ip?: string | null; host?: string; site?: string; xff?: string } = {},
) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    host: opts.host ?? "minberegner.dk",
  };
  // A fresh /24 per call so the rate limit never interferes.
  const ip = opts.ip === undefined ? `81.7.${++n % 250}.234` : opts.ip;
  if (ip !== null) headers["cf-connecting-ip"] = ip;
  if (opts.xff) headers["x-forwarded-for"] = opts.xff;
  if (opts.site) headers["sec-fetch-site"] = opts.site;
  return POST(
    new NextRequest("http://localhost/api/cvr", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers,
    }),
  );
}

const kald = () => vi.mocked(postTilCvrradar);

function svarFraCvrradar(json: unknown, status = 200) {
  kald().mockImplementation(async () => ({ status, json }));
}

const sendtBody = () => kald().mock.calls[0][2] as Record<string, unknown>;

// cvrradar's answer for a company (mahope/cvr src/beregner/web.ts, BeregnerSvar).
const SELSKAB = {
  cvr: CVR,
  selskab: true,
  navn: "Mahope ApS",
  aktiv: true,
  moms: {
    registreret: "ja",
    periode: "halvaar",
    grundlag: "omsaetning",
    regnskabsaar: "2025",
    frister: [
      { fra: "2026-07-01", til: "2026-12-31", frist: "2027-03-01" },
      { fra: "2027-01-01", til: "2027-06-30", frist: "2027-09-01" },
    ],
    vejledende: true,
  },
  observation: { gemt: true },
};

describe("POST /api/cvr", () => {
  beforeEach(() => {
    kald().mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "1");
    vi.stubEnv("CVRRADAR_BEREGNER_NOEGLE", "test-noegle");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is 404 with the flag off and never calls cvrradar", async () => {
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "0");
    const res = await post({ cvr: CVR, samtykke: true });
    expect(res.status).toBe(404);
    expect(kald()).not.toHaveBeenCalled();
  });

  it.each(["beraknare.se", "beregner.no", "evil.example"])("is 404 on %s", async (host) => {
    const res = await post({ cvr: CVR }, { host });
    expect(res.status).toBe(404);
    expect(kald()).not.toHaveBeenCalled();
  });

  it("rejects cross-site calls", async () => {
    const res = await post({ cvr: CVR }, { site: "cross-site" });
    expect(res.status).toBe(403);
    expect(kald()).not.toHaveBeenCalled();
  });

  it.each([
    ["no body", "x"],
    ["no CVR", { samtykke: true }],
    ["short CVR", { cvr: "1234" }],
    ["bad checksum", { cvr: "39413893" }],
    ["number", { cvr: 39413892 }],
  ])("rejects %s with 400 and makes no call", async (_navn, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(kald()).not.toHaveBeenCalled();
  });

  it("answers tilgaengelig:false without a key", async () => {
    vi.stubEnv("CVRRADAR_BEREGNER_NOEGLE", "");
    const res = await post({ cvr: CVR });
    expect(await res.json()).toEqual({ tilgaengelig: false });
    expect(kald()).not.toHaveBeenCalled();
  });

  it("with consent sends cvrradar's field names, only the /24 prefix and mail domain, with the key", async () => {
    svarFraCvrradar(SELSKAB);
    const res = await post({ cvr: CVR, samtykke: true, mail: "anna.hansen@firma.dk" }, { ip: "81.7.12.234" });
    const [url, noegle, body, timeout] = kald().mock.calls[0];
    expect(url).toBe("https://cvrradar.dk/v1/intern/beregner");
    expect(noegle).toBe("test-noegle");
    expect(timeout).toBeGreaterThan(0);
    expect(body).toEqual({
      cvr: CVR,
      samtykke: "cvrradar-kunder",
      eget: true,
      ip_praefiks: "81.7.12.0/24",
      maildomaene: "firma.dk",
    });
    expect(JSON.stringify(body)).not.toMatch(/234|anna|@/);

    const data = await res.json();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(data).toEqual({
      tilgaengelig: true,
      fundet: true,
      cvr: CVR,
      selskab: true,
      navn: "Mahope ApS",
      aktiv: true,
      momsregistreret: "ja",
      momsperiode: "halvaar",
      grundlag: "omsaetning",
      regnskabsaar: "2025",
      frister: SELSKAB.moms.frister,
      gemt: true,
    });
    expect(JSON.stringify(data)).not.toContain("test-noegle");
  });

  it("reads the IP from CF-Connecting-IP and ignores a forged X-Forwarded-For", async () => {
    svarFraCvrradar(SELSKAB);
    await post({ cvr: CVR, samtykke: true }, { ip: "81.7.12.234", xff: "203.0.113.9, 81.7.12.234" });
    expect(sendtBody().ip_praefiks).toBe("81.7.12.0/24");
  });

  it("sends no prefix when only X-Forwarded-For is present", async () => {
    svarFraCvrradar(SELSKAB);
    await post({ cvr: CVR, samtykke: true }, { ip: null, xff: "203.0.113.9" });
    expect(sendtBody()).not.toHaveProperty("ip_praefiks");
    expect(JSON.stringify(sendtBody())).not.toContain("203.0.113");
  });

  it("cuts IPv6 to /48", async () => {
    svarFraCvrradar(SELSKAB);
    await post({ cvr: CVR, samtykke: true }, { ip: "2a01:4f8:c17:beef::42" });
    expect(sendtBody().ip_praefiks).toBe("2a01:4f8:c17::/48");
  });

  it("without consent sends no prefix, no mail domain and samtykke 'none'", async () => {
    svarFraCvrradar(SELSKAB);
    const res = await post({ cvr: CVR, mail: "anna@firma.dk" }, { ip: "81.7.12.234" });
    expect(sendtBody()).toEqual({ cvr: CVR, samtykke: "none", eget: false });
    const data = await res.json();
    // Even if cvrradar claims it stored something, we never say so without consent.
    expect(data.gemt).toBe(false);
    expect(data.momsperiode).toBe("halvaar");
  });

  it("treats a non-boolean samtykke as no consent", async () => {
    svarFraCvrradar(SELSKAB);
    await post({ cvr: CVR, samtykke: "true" });
    expect(sendtBody().samtykke).toBe("none");
    expect(sendtBody()).not.toHaveProperty("ip_praefiks");
  });

  it("never passes person fields through", async () => {
    svarFraCvrradar({ ...SELSKAB, ejere: [{ navn: "Person Personsen" }], direktion: ["Person Personsen"] });
    const tekst = JSON.stringify(await (await post({ cvr: CVR })).json());
    expect(tekst).not.toMatch(/Person|ejere|direktion/);
  });

  it("answers selskab:false for a sole proprietorship with nothing else", async () => {
    svarFraCvrradar({ cvr: CVR, selskab: false, observation: { gemt: false }, besked: "kun selskaber", navn: "Anna Hansen" });
    const data = await (await post({ cvr: CVR, samtykke: true })).json();
    expect(data).toEqual({ tilgaengelig: true, fundet: true, selskab: false, cvr: CVR });
  });

  it("maps not found and failures", async () => {
    svarFraCvrradar({ fejl: "CVR-nummeret findes ikke." }, 404);
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: true, fundet: false });
    svarFraCvrradar({ fejl: "Endpointet er kun til servere, ikke browsere." }, 403);
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
    svarFraCvrradar({ fundet: true }); // the old, made-up shape
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
    svarFraCvrradar(null, 502);
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
    kald().mockRejectedValue(new Error("timeout"));
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
  });

  it("never logs the IP", async () => {
    kald().mockRejectedValue(new Error("nede"));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    await post({ cvr: CVR, samtykke: true }, { ip: "81.7.99.234" });
    const alt = [console.warn, log, err].flatMap((f) => vi.mocked(f).mock.calls.flat()).join(" ");
    expect(alt).not.toContain("81.7.99");
  });

  it("rate limits per /24 network, and a forged X-Forwarded-For does not get around it", async () => {
    svarFraCvrradar(SELSKAB);
    const status: number[] = [];
    for (let i = 0; i < 21; i++) {
      status.push((await post({ cvr: CVR }, { ip: `81.7.251.${i + 1}`, xff: `203.0.${i}.1` })).status);
    }
    expect(status.slice(0, 20).every((s) => s === 200)).toBe(true);
    expect(status[20]).toBe(429);
  });
});
