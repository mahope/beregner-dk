import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const CVR = "39413892";
let n = 0;

function post(body: unknown, opts: { ip?: string; host?: string; site?: string } = {}) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    // A fresh /24 per call so the rate limit never interferes.
    "x-forwarded-for": opts.ip ?? `81.7.${++n % 250}.234, 10.0.0.1`,
    host: opts.host ?? "minberegner.dk",
  };
  if (opts.site) headers["sec-fetch-site"] = opts.site;
  return POST(
    new NextRequest("http://localhost/api/cvr", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers,
    }),
  );
}

function svarFraCvrradar(body: unknown, status = 200) {
  vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify(body), { status }));
}

const sendtBody = () => JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));

describe("POST /api/cvr", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "1");
    vi.stubEnv("CVRRADAR_BEREGNER_NOEGLE", "test-noegle");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is 404 with the flag off and never calls cvrradar", async () => {
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "0");
    const res = await post({ cvr: CVR, samtykke: true });
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["beraknare.se", "beregner.no", "evil.example"])("is 404 on %s", async (host) => {
    const res = await post({ cvr: CVR }, { host });
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects cross-site calls", async () => {
    const res = await post({ cvr: CVR }, { site: "cross-site" });
    expect(res.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
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
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers tilgaengelig:false without a key", async () => {
    vi.stubEnv("CVRRADAR_BEREGNER_NOEGLE", "");
    const res = await post({ cvr: CVR });
    expect(await res.json()).toEqual({ tilgaengelig: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("with consent sends only the /24 prefix and mail domain, with the key as bearer", async () => {
    svarFraCvrradar({ fundet: true, navn: "Mahope", momsregistreret: true, omsaetning: 800_000, laert: true });
    const res = await post(
      { cvr: CVR, samtykke: true, mail: "anna.hansen@firma.dk" },
      { ip: "81.7.12.234, 172.18.0.2" },
    );
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://cvrradar.dk/v1/intern/beregner");
    expect((init?.headers as Record<string, string>).authorization).toBe("Bearer test-noegle");
    expect(sendtBody()).toEqual({
      cvr: CVR,
      kilde: "minberegner.dk/moms",
      samtykke: "begge",
      eget: true,
      ipPrefiks: "81.7.12.0/24",
      mailDomaene: "firma.dk",
    });
    expect(String(init?.body)).not.toMatch(/234|anna|@/);

    const data = await res.json();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(data).toEqual({
      tilgaengelig: true,
      fundet: true,
      cvr: CVR,
      navn: "Mahope",
      momsregistreret: true,
      momsperiode: "halvaar",
      momsperiodeKilde: "omsaetning",
      omsaetning: 800_000,
      laert: true,
    });
    expect(JSON.stringify(data)).not.toContain("test-noegle");
  });

  it("cuts IPv6 to /48", async () => {
    svarFraCvrradar({ fundet: true });
    await post({ cvr: CVR, samtykke: true }, { ip: "2a01:4f8:c17:beef::42" });
    expect(sendtBody().ipPrefiks).toBe("2a01:4f8:c17::/48");
  });

  it("without consent sends no prefix, no mail domain and samtykke 'ingen'", async () => {
    svarFraCvrradar({ fundet: true, laert: true, momsperiode: "kvartal" });
    const res = await post({ cvr: CVR, mail: "anna@firma.dk" }, { ip: "81.7.12.234" });
    expect(sendtBody()).toEqual({ cvr: CVR, kilde: "minberegner.dk/moms", samtykke: "ingen", eget: false });
    const data = await res.json();
    // Even if cvrradar claims it learned, we never tell the visitor so without consent.
    expect(data.laert).toBe(false);
    expect(data.momsperiode).toBe("kvartal");
    expect(data.momsperiodeKilde).toBe("cvrradar");
  });

  it("treats a non-boolean samtykke as no consent", async () => {
    svarFraCvrradar({ fundet: true });
    await post({ cvr: CVR, samtykke: "true" });
    expect(sendtBody().samtykke).toBe("ingen");
    expect(sendtBody()).not.toHaveProperty("ipPrefiks");
  });

  it("never passes person fields through", async () => {
    svarFraCvrradar({ fundet: true, navn: "Firma", ejere: [{ navn: "Person Personsen" }], direktion: ["Person Personsen"] });
    const res = await post({ cvr: CVR });
    const tekst = JSON.stringify(await res.json());
    expect(tekst).not.toMatch(/Person|ejere|direktion/);
  });

  it("uses the start rule when turnover is unknown", async () => {
    svarFraCvrradar({ fundet: true, navn: "Ny ApS" });
    const data = await (await post({ cvr: CVR })).json();
    expect(data.momsperiode).toBe("halvaar");
    expect(data.momsperiodeKilde).toBe("standard");
  });

  it("maps not found and failures", async () => {
    svarFraCvrradar({}, 404);
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: true, fundet: false });
    svarFraCvrradar({ fundet: false });
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: true, fundet: false });
    svarFraCvrradar({ fejl: "x" }, 500);
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
    vi.mocked(fetch).mockRejectedValue(new Error("timeout"));
    expect(await (await post({ cvr: CVR })).json()).toEqual({ tilgaengelig: false });
  });

  it("never logs the IP", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("nede"));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    await post({ cvr: CVR, samtykke: true }, { ip: "81.7.99.234" });
    const alt = [console.warn, log, err].flatMap((f) => vi.mocked(f).mock.calls.flat()).join(" ");
    expect(alt).not.toContain("81.7.99");
  });

  it("rate limits per /24 network", async () => {
    svarFraCvrradar({ fundet: true });
    const ip = "81.7.251.";
    const status: number[] = [];
    for (let i = 0; i < 21; i++) status.push((await post({ cvr: CVR }, { ip: `${ip}${i + 1}` })).status);
    expect(status.slice(0, 20).every((s) => s === 200)).toBe(true);
    expect(status[20]).toBe(429);
  });
});
