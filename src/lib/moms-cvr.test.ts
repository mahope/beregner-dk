import { afterEach, describe, expect, it, vi } from "vitest";
import {
  byggeCvrradarForespoergsel,
  erGyldigtCvr,
  ipPrefiks,
  isMomsCvrEnabled,
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
    ["2001:db8:abcd:12:3456:789a:bcde:f012", "2001:db8:abcd::/48"],
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

describe("byggeCvrradarForespoergsel", () => {
  const ip = "81.7.12.234";
  const mail = "anna.hansen@firma.dk";

  it("with consent sends prefix and mail domain, never the full IP or local part", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: true, ip, mail });
    expect(body).toEqual({
      cvr: "39413892",
      kilde: "minberegner.dk/moms",
      samtykke: "begge",
      eget: true,
      ipPrefiks: "81.7.12.0/24",
      mailDomaene: "firma.dk",
    });
    const tekst = JSON.stringify(body);
    expect(tekst).not.toContain("234");
    expect(tekst).not.toContain("anna");
    expect(tekst).not.toContain("@");
  });

  it("without consent sends no learning data at all", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: false, ip, mail });
    expect(body).toEqual({ cvr: "39413892", kilde: "minberegner.dk/moms", samtykke: "ingen", eget: false });
    expect(body).not.toHaveProperty("ipPrefiks");
    expect(body).not.toHaveProperty("mailDomaene");
  });

  it("leaves out a private IP even with consent", () => {
    const body = byggeCvrradarForespoergsel({ cvr: "39413892", samtykke: true, ip: "192.168.0.7" });
    expect(body).not.toHaveProperty("ipPrefiks");
    expect(body.samtykke).toBe("begge");
  });
});

describe("parseCvrradarSvar", () => {
  it("keeps only company fields", () => {
    const svar = parseCvrradarSvar({
      fundet: true,
      navn: " Mahope ",
      momsregistreret: true,
      omsaetning: 1_200_000,
      momsperiode: "kvartal",
      laert: true,
      ejere: [{ navn: "Person" }],
      direktion: ["Person"],
    });
    expect(svar).toEqual({
      fundet: true,
      navn: "Mahope",
      momsregistreret: true,
      omsaetning: 1_200_000,
      momsperiode: "kvartal",
      laert: true,
    });
    expect(JSON.stringify(svar)).not.toContain("Person");
  });

  it("treats unknown or bad values as null", () => {
    expect(parseCvrradarSvar({ fundet: true, momsregistreret: "ja", omsaetning: -5, momsperiode: "uge", laert: "ja" })).toEqual({
      fundet: true,
      navn: null,
      momsregistreret: null,
      omsaetning: null,
      momsperiode: null,
      laert: false,
    });
  });

  it.each([null, "x", {}, { fundet: "ja" }])("rejects %s", (v) => {
    expect(parseCvrradarSvar(v)).toBeNull();
  });
});
