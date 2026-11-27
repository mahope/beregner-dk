import { afterEach, describe, expect, it, vi } from "vitest";
import {
  byggeCvrradarForespoergsel,
  erGyldigtCvr,
  ipPrefiks,
  isMomsCvrEnabled,
  klientIpFraHeaders,
  mailDomaene,
  parseCvrradarSvar,
  rensCvr,
} from "./moms-cvr";

afterEach(() => vi.unstubAllEnvs());

describe("isMomsCvrEnabled", () => {
  it.each([
    [undefined, false],
    ["", false],
    ["0", false],
    ["false", false],
    ["yes", false],
    ["1", true],
    ["true", true],
  ])("NEXT_PUBLIC_MOMS_CVR=%s gives %s", (v, forventet) => {
    if (v === undefined) vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", undefined as unknown as string);
    else vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", v);
    expect(isMomsCvrEnabled()).toBe(forventet);
  });
});

describe("CVR validation", () => {
  it("cleans spaces, dashes and DK prefix", () => {
    expect(rensCvr(" DK 39 41 38 92 ")).toBe("39413892");
    expect(rensCvr("3941-3892")).toBe("39413892");
  });

  it("accepts numbers that pass modulus 11", () => {
    expect(erGyldigtCvr("39413892")).toBe(true); // Mahope
  });

  it.each(["39413893", "3941389", "394138920", "09413892", "abcdefgh", "", null, 39413892])(
    "rejects %s",
    (v) => {
      expect(erGyldigtCvr(v)).toBe(false);
    },
  );
});

describe("ipPrefiks", () => {
  it.each([
    // Each octet is distinct so keeping too much or too little is caught.
    ["203.0.113.77", "203.0.113.0/24"],
    ["198.51.100.255", "198.51.100.0/24"],
    ["81.7.12.34", "81.7.12.0/24"],
    [" 81.7.12.34 ", "81.7.12.0/24"],
    ["::ffff:81.7.12.34", "81.7.12.0/24"],
    ["::ffff:5107:c22", "81.7.12.0/24"],
    ["2a02:c7c:abcd:12:3456:789a:bcde:f012", "2a02:c7c:abcd::/48"],
    ["2a01:4f8:c17:1234::1", "2a01:4f8:c17::/48"],
    ["2a01:4f8::1", "2a01:4f8:0::/48"],
    ["[2a01:4f8:c17:1234::1]", "2a01:4f8:c17::/48"],
    ["2A01:04F8:0C17:FFFF:0:0:0:9", "2a01:4f8:c17::/48"],
  ])("%s -> %s", (ip, forventet) => {
    expect(ipPrefiks(ip)).toBe(forventet);
  });

  it("never returns any part of the host portion", () => {
    expect(ipPrefiks("81.7.12.234")).not.toContain("234");
    expect(ipPrefiks("2a01:4f8:c17:beef:cafe::1")).not.toMatch(/beef|cafe/);
  });

  it.each([
    "10.1.2.3",
    "127.0.0.1",
    "192.168.1.20",
    "172.16.5.4",
    "172.31.0.1",
    "169.254.1.1",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    // Reserved nets cvrradar rejects with 400: 192.0.0.0/16, 198.18.0.0/15, 2001:db8::/32.
    "192.0.2.10",
    "198.18.5.6",
    "198.19.5.6",
    "2001:db8:abcd::1",
    "::1",
    "::",
    "fe80::1",
    "fd00::1",
    "ff02::1",
    "::ffff:10.0.0.1",
    "256.1.1.1",
    "1.2.3",
    "1.2.3.4.5",
    "2001:db8::1::2",
    "2001:db8:1:2:3:4:5:6:7",
    "gggg::1",
    "ukendt",
    "",
    null,
    undefined,
  ])("returns null for %s", (ip) => {
    expect(ipPrefiks(ip)).toBeNull();
  });

  it("keeps public 172.x outside 172.16/12", () => {
    expect(ipPrefiks("172.32.9.8")).toBe("172.32.9.0/24");
  });
});

describe("mailDomaene", () => {
  it.each([
    ["anna.hansen@firma.dk", "firma.dk"],
    ["  Anna@Firma.DK ", "firma.dk"],
    ['"a@b"@sub.firma.dk', "sub.firma.dk"],
  ])("%s -> %s", (mail, d) => {
    expect(mailDomaene(mail)).toBe(d);
  });

  it.each(["firma.dk", "@firma.dk", "anna@", "anna@localhost", "anna@-x.dk", 42, null])("rejects %s", (v) => {
    expect(mailDomaene(v)).toBeNull();
  });
});


describe("klientIpFraHeaders", () => {
  it("reads CF-Connecting-IP, which Cloudflare overwrites", () => {
    expect(klientIpFraHeaders(new Headers({ "cf-connecting-ip": "81.7.12.34" }))).toBe("81.7.12.34");
  });

  it("never uses a forged X-Forwarded-For or X-Real-IP", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9, 81.7.12.34", "x-real-ip": "203.0.113.9" });
    expect(klientIpFraHeaders(h)).toBeNull();
    h.set("cf-connecting-ip", "81.7.12.34");
    expect(klientIpFraHeaders(h)).toBe("81.7.12.34");
  });

  it("refuses a list in the trusted header", () => {
    expect(klientIpFraHeaders(new Headers({ "cf-connecting-ip": "203.0.113.9, 81.7.12.34" }))).toBeNull();
  });

  it("can be pointed at another single-value header", () => {
    vi.stubEnv("MOMS_CVR_IP_HEADER", "X-Real-IP");
    const h = new Headers({ "x-real-ip": "81.7.12.34", "cf-connecting-ip": "203.0.113.9" });
    expect(klientIpFraHeaders(h)).toBe("81.7.12.34");
  });
});

describe("byggeCvrradarForespoergsel", () => {
  const ip = "81.7.12.234";
  const mail = "anna.hansen@firma.dk";

  it("with consent sends prefix and mail domain under cvrradar's names, never the full IP or local part", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: true, ipPrefiks: ipPrefiks(ip), mail });
    expect(body).toEqual({
      cvr: "39413892",
      samtykke: "cvrradar-kunder",
      eget: true,
      ip_praefiks: "81.7.12.0/24",
      maildomaene: "firma.dk",
    });
    const tekst = JSON.stringify(body);
    expect(tekst).not.toContain("234");
    expect(tekst).not.toContain("anna");
    expect(tekst).not.toContain("@");
  });

  it("without consent sends no learning data at all", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: false, ipPrefiks: ipPrefiks(ip), mail });
    expect(body).toEqual({ cvr: "39413892", samtykke: "none", eget: false });
    expect(body).not.toHaveProperty("ip_praefiks");
    expect(body).not.toHaveProperty("maildomaene");
  });

  it("leaves out a private IP even with consent", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: true, ipPrefiks: ipPrefiks("192.168.0.7") });
    expect(body).not.toHaveProperty("ip_praefiks");
    expect(body.samtykke).toBe("cvrradar-kunder");
  });

  it.each(["81.7.12.234", "81.7.12.234/24", "2a01:4f8:c17:1234::1", "81.7.0.0/16"])(
    "drops a value that is not a /24 or /48 prefix (%s)",
    (v) => {
      const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: true, ipPrefiks: v });
      expect(body).not.toHaveProperty("ip_praefiks");
    },
  );
});

describe("parseCvrradarSvar", () => {
  const selskab = {
    cvr: "39413892",
    selskab: true,
    navn: " Mahope ApS ",
    aktiv: true,
    moms: {
      registreret: "ja",
      periode: "kvartal",
      grundlag: "omsaetning",
      regnskabsaar: "2025",
      frister: [{ fra: "2026-07-01", til: "2026-09-30", frist: "2026-12-01" }],
      vejledende: true,
    },
    observation: { gemt: true },
  };

  it("keeps only company fields from cvrradar's answer", () => {
    const svar = parseCvrradarSvar({ ...selskab, ejere: [{ navn: "Person" }], direktion: ["Person"] });
    expect(svar).toEqual({
      selskab: true,
      navn: "Mahope ApS",
      aktiv: true,
      momsregistreret: "ja",
      momsperiode: "kvartal",
      grundlag: "omsaetning",
      regnskabsaar: "2025",
      frister: [{ fra: "2026-07-01", til: "2026-09-30", frist: "2026-12-01" }],
      gemt: true,
    });
    expect(JSON.stringify(svar)).not.toContain("Person");
  });

  it("keeps nothing but selskab:false for a non-company, even if a name comes along", () => {
    expect(parseCvrradarSvar({ cvr: "39413892", selskab: false, navn: "Anna Hansen", observation: { gemt: true } })).toEqual({
      selskab: false,
      gemt: false,
    });
  });

  it("treats unknown or bad values as unknown", () => {
    expect(
      parseCvrradarSvar({
        selskab: true,
        moms: { registreret: true, periode: "uge", grundlag: "gaet", frister: [{ fra: "2026-07-01" }] },
        observation: { gemt: "ja" },
      }),
    ).toEqual({
      selskab: true,
      navn: null,
      aktiv: true,
      momsregistreret: "ukendt",
      momsperiode: null,
      grundlag: "ukendt",
      regnskabsaar: null,
      frister: [],
      gemt: false,
    });
  });

  it("drops deadlines with bad dates and keeps the good ones", () => {
    const svar = parseCvrradarSvar({
      ...selskab,
      moms: {
        ...selskab.moms,
        frister: [{ fra: "2026-07-01", til: "2026-09-30", frist: "1. december" }, ...selskab.moms.frister, "x"],
      },
    });
    expect(svar?.selskab && svar.frister).toEqual(selskab.moms.frister);
  });

  it.each([null, "x", {}, { fundet: true }, { selskab: "ja" }])("rejects %s", (v) => {
    expect(parseCvrradarSvar(v)).toBeNull();
  });
});
