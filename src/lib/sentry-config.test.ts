import { describe, expect, it } from "vitest";
import {
  FALLBACK_SENTRY_DSN,
  SCRUBBED_VALUE,
  scrubSentryEvent,
  scrubSentryUrl,
  SENTRY_DATA_COLLECTION,
  SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
  sentryDsn,
  sentryIsEnabled,
  SENTRY_TRACES_SAMPLE_RATE,
} from "./sentry-config";

/** Every leaf must be off: `false`, `0` or `[]`. Nothing may be `true`. */
function slåAlleBladeTil(value: unknown, sti: string): string[] {
  if (Array.isArray(value)) return value.length ? [`${sti} har indhold`] : [];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([nøgle, under]) =>
      slåAlleBladeTil(under, `${sti}.${nøgle}`),
    );
  }
  return value === true ? [`${sti} er true`] : [];
}

describe("SENTRY_DATA_COLLECTION", () => {
  it("slår hver eneste kilde fra — v11 samler cookies og headers som standard", () => {
    expect(slåAlleBladeTil(SENTRY_DATA_COLLECTION, "dataCollection")).toEqual([]);
  });

  it("dækker de felter der findes i v11's DataCollection", () => {
    // En ny SDK-version kan tilføje et felt med default `true`; den skal møde
    // den her liste, ellers ville den blive slået fra ved en opgradering.
    expect(Object.keys(SENTRY_DATA_COLLECTION).sort()).toEqual([
      "cookies",
      "databaseQueryData",
      "genAI",
      "graphQL",
      "httpBodies",
      "httpHeaders",
      "queues",
      "stackFrameVariables",
      "urlQueryParams",
      "userInfo",
    ]);
  });

  it("samler ingen HTTP-body", () => {
    expect(SENTRY_DATA_COLLECTION.httpBodies).toEqual([]);
  });
});

describe("sentryDsn", () => {
  it("faller tilbage på minberegner-projektets DSN", () => {
    expect(sentryDsn({})).toBe(FALLBACK_SENTRY_DSN);
    expect(FALLBACK_SENTRY_DSN).toMatch(
      /^https:\/\/[a-f0-9]{32}@[a-z0-9.]+\/\d+$/,
    );
  });

  it("lader env-variablen styre, også når den kun er mellemrum", () => {
    expect(sentryDsn({ NEXT_PUBLIC_SENTRY_DSN: "https://x@y/2" })).toBe(
      "https://x@y/2",
    );
    expect(sentryDsn({ NEXT_PUBLIC_SENTRY_DSN: "  " })).toBe(FALLBACK_SENTRY_DSN);
  });
});

describe("sentryIsEnabled", () => {
  it("sender kun fra produktion — ellers fylder next dev projektet", () => {
    expect(sentryIsEnabled({ NODE_ENV: "production" })).toBe(true);
    expect(sentryIsEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(sentryIsEnabled({ NODE_ENV: "test" })).toBe(false);
  });
});

describe("tracesSampleRate", () => {
  it("er 0,1 — nok til at finde fejl, ikke nok til at tænke alle besøg igennem", () => {
    expect(SENTRY_TRACES_SAMPLE_RATE).toBe(0.1);
  });
});

describe("SENTRY_REPLAYS_SESSION_SAMPLE_RATE", () => {
  it("er 0 — Session Replay optager skærmen og kræver samtykke", () => {
    expect(SENTRY_REPLAYS_SESSION_SAMPLE_RATE).toBe(0);
  });
});

describe("scrubSentryUrl", () => {
  it("fjernede værdi, når kalkulatorens tilstand lå i URL'en", () => {
    expect(scrubSentryUrl("https://minberegner.dk/loen?s=U3RhdGU6eyJiaWxvIjo0MjAwMH0")).toBe(
      `https://minberegner.dk/loen?s=${SCRUBBED_VALUE}`,
    );
  });

  it("lader resten af URL'en være urørt", () => {
    // %26 er en kodet "&" — altså en del af værdien, ikke en ny parameter.
    expect(
      scrubSentryUrl("https://minberegner.dk/procent?a=1&s=x%3D1%262%26b=3#frag"),
    ).toBe(`https://minberegner.dk/procent?a=1&s=${SCRUBBED_VALUE}#frag`);
  });

  it("gør ingenting ved en URL uden tilstand", () => {
    const url = "https://minberegner.dk/dato?a=1#sammenlign";
    expect(scrubSentryUrl(url)).toBe(url);
  });

  it("skjuler også en værdi i fragmentet, hvor staten lægges", () => {
    expect(scrubSentryUrl("https://beraknare.se/loen#s=abc")).toBe(
      `https://beraknare.se/loen#s=${SCRUBBED_VALUE}`,
    );
  });

  it("rammer ikke parameteren \"s\" på anden plads i en tredjeplads-værdi", () => {
    // "?as=1" må ikke miste sin værdi — kun nøjagtig nøglen "s".
    expect(scrubSentryUrl("https://minberegner.dk/x?as=1")).toBe(
      "https://minberegner.dk/x?as=1",
    );
  });
});

describe("scrubSentryEvent", () => {
  it("skrubber både request.url og query_string", () => {
    const event = {
      request: {
        url: "https://minberegner.dk/loen?s=hemmeligt",
        query_string: "s=hemmeligt&x=2",
      },
    };
    scrubSentryEvent(event);
    expect(event.request.url).toBe(`https://minberegner.dk/loen?s=${SCRUBBED_VALUE}`);
    expect(event.request.query_string).toBe(`s=${SCRUBBED_VALUE}&x=2`);
  });

  it("går ikke ned i en hændelse uden request", () => {
    const event = {};
    expect(scrubSentryEvent(event)).toBe(event);
  });
});
