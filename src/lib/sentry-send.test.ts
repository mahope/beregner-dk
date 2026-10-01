// @vitest-environment node
/**
 * Bevis for at en Sentry-hændelse faktisk forlader processen — og at
 * `beforeSend` kører på vej ud.
 *
 * `sentry-config.test.ts` dømmer på `scrubSentryEvent` som en ren funktion. Det
 * siger intet om den nogensinde er *registreret* på klienten: hvis en
 * `beforeSend`-linje forsvinder fra `sentry.server.config.ts` eller
 * `instrumentation-client.ts`, står alle de tests stadig grønne, og
 * beregningstilstanden i `?s=`-linkene (`calculation-state-privacy.ts`) ryger
 * ud til USA. Det er den egenskab, den her fil låser.
 *
 * Tilfældet der lå bag spørgsmålet i planen: en manuel kastende route handler
 * nåede `onRequestError` med fuld request-kontekst, men en lokal collector på
 * 127.0.0.1 modtog ingen envelope, og mistanken var `silent: true` i
 * `next.config.ts`. Den er målt modsat: transporten sender, også over ren
 * `http://`, og `silent: true` slår den ikke fra.
 *
 * **Hvad porten ikke dækker:** en hændelse helt fra en rigtig indgående
 * forespørgsel og ud på ledningen. SDK'en fylder først `event.request` fra en
 * reel request, og `@sentry/nextjs` gen-eksporterer hverken `setRequest` eller
 * `getIsolationScope`, så den kan ikke efterlignes her. Den vej er i stedet
 * dækket af de to andre tests: den live klients `beforeSend` *er*
 * `scrubSentryEvent`, og begge init-steder registrerer den.
 */
import http from "node:http";
import type { AddressInfo } from "node:net";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SCRUBBED_VALUE } from "./sentry-config";
import { nextRouterStateParseFejl } from "./__fixtures__/next-router-state-fejl";
import {
  initSentryServer,
  resetSentryServerForTests,
} from "../sentry.server.config";

/** The `?s=` state a share link carries, as `calculation-state-privacy.ts` encodes it. */
const HEMLIG_TILSTAND = "eyJibWkiOjMxLCJoIjoiMS44MiJ9";

interface Indkommet {
  url: string;
  body: string;
}

const indkomne: Indkommet[] = [];
let server: http.Server;
let port: number;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (del) => {
      body += del;
    });
    req.on("end", () => {
      indkomne.push({ url: req.url ?? "", body });
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"id":"selvtest"}');
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  port = (server.address() as AddressInfo).port;

  // `stubEnv`, not assignment: `process.env.NODE_ENV` is readonly under Next's
  // own types, and the SDK only reports when `sentryIsEnabled()` sees production.
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", `http://selvtest@127.0.0.1:${port}/1`);
  // The real init — not a hand-rolled `Sentry.init` — so the test fails if
  // `sentry.server.config.ts` ever stops registering `beforeSend`.
  expect(initSentryServer()).toBe(true);
}, 20_000);

afterAll(async () => {
  vi.unstubAllEnvs();
  resetSentryServerForTests();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

/** Capture and wait for the transport to actually drain. */
async function sendOgVent(hændelse: () => unknown): Promise<void> {
  const Sentry = await import("@sentry/nextjs");
  const før = indkomne.length;
  hændelse();
  await Sentry.flush(5_000);
  // The Node transport hands the envelope to the agent on a later tick, so a
  // flush that returns before the socket writes would read as "nothing sent".
  await ventPåTransport(indkomne.length, før);
}

/**
 * Only the event envelopes count. A dropped event still produces a *client
 * report* envelope — `{}` on the wire — because Sentry reports its own outcome;
 * counting those would make a working filter look like a leak.
 */
function antalEvents(): number {
  return indkomne.filter((indkommet) => indkommet.body.includes('"type":"event"')).length;
}

/**
 * Wait until the count reaches `forventet`, or give up. A dropped event never
 * arrives, so the negative cases have to wait out a real budget — otherwise
 * they pass in a millisecond, before the envelope would have gone out.
 */
async function ventPåTransport(
  indkommet: number,
  forventet: number,
  budget = 2_000,
): Promise<void> {
  const deadline = Date.now() + budget;
  while (indkommet === forventet && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe("Sentry sender fra processen", () => {
  it("lægger en envelope hos collectoren med undtagelsen i sig", async () => {
    const Sentry = await import("@sentry/nextjs");
    await sendOgVent(() => {
      Sentry.getClient()?.captureException(new Error("selvtest-sendepipeline"));
    });

    expect(indkomne.length).toBeGreaterThan(0);
    const envelope = indkomne.at(-1) as Indkommet;
    expect(envelope.url).toContain("/api/1/envelope/");
    expect(envelope.url).toContain("sentry_key=selvtest");
    expect(envelope.body).toContain('"type":"event"');
    expect(envelope.body).toContain("selvtest-sendepipeline");
  }, 20_000);
});

describe("RSC-støjen fra Next overhovedet ikke forlader processen", () => {
  it("sender 0 envelopes for Next's egen router-state fejl", async () => {
    const Sentry = await import("@sentry/nextjs");
    const før = indkomne.length;
    const eventsFør = antalEvents();

    // Next's egen kaster, ikke en efterligning: det er den her fejl der fylder
    // Sentry-projektet (MINBEREGNER-1, 15 hændelser på 14 dage).
    Sentry.getClient()?.captureException(nextRouterStateParseFejl());
    await Sentry.flush(5_000);
    await ventPåTransport(indkomne.length, før);

    expect(antalEvents()).toBe(eventsFør);
  }, 20_000);

  it("sender 0 envelopes for den samme fejl med en omskrevet ordlyd", async () => {
    const Sentry = await import("@sentry/nextjs");
    const før = indkomne.length;
    const eventsFør = antalEvents();

    // Sådan ser en Next-opgradering ud: samme fejl, ny formulering. `E10` er
    // ikke på den serialiserede hændelse (målt: hintet bærer kun `event_id`
    // og `integrations`), så det er emnet i sætningen, der holder filteret.
    const fejl = nextRouterStateParseFejl();
    fejl.message = "The router state header could not be read.";
    Sentry.getClient()?.captureException(fejl);
    await Sentry.flush(5_000);
    await ventPåTransport(indkomne.length, før);

    expect(fejl.message).not.toBe(nextRouterStateParseFejl().message);
    expect(antalEvents()).toBe(eventsFør);
  }, 20_000);

  it("sender stadig en rigtig fejl, så filteret ikke dræber projektet", async () => {
    const Sentry = await import("@sentry/nextjs");
    const før = indkomne.length;

    Sentry.getClient()?.captureException(new Error("kontrol-ikke-stoej"));
    await Sentry.flush(5_000);
    await ventPåTransport(indkomne.length, før);

    expect(indkomne.length).toBeGreaterThan(før);
    expect(indkomne.at(-1)?.body).toContain("kontrol-ikke-stoej");
  }, 20_000);
});

describe("beforeSend er registreret, ikke bare defineret", () => {
  it("har scrubSentryEvent som den live klients beforeSend", async () => {
    const Sentry = await import("@sentry/nextjs");
    const beforeSend = Sentry.getClient()?.getOptions()?.beforeSend;
    // Not registered at all: exactly what happens if someone drops the
    // `beforeSend` line, and the state in `?s=` then leaves the country.
    expect(typeof beforeSend).toBe("function");

    // Sentry v11's *client* `ErrorEvent` narrows `request.url` to `undefined`
    // (browsers report request data as span attributes), while the wire shape
    // `scrubSentryEvent` is handed by `onRequestError` still has it. So the
    // registered function is called through an own type instead of the SDK's.
    // `query_string`'s three shapes are covered as a pure function in
    // `sentry-config.test.ts`.
    interface HændelseMedUrl {
      request: { url: string };
    }
    const kal = beforeSend as unknown as (
      hændelse: HændelseMedUrl,
      hint: object,
    ) => HændelseMedUrl;

    // The value is replaced, so the URL survives and the state does not.
    const renset = kal(
      {
        request: {
          url: `https://minberegner.dk/bmi?s=${HEMLIG_TILSTAND}&h=1.82`,
        },
      },
      {},
    );
    expect(renset.request.url).toBe(
      `https://minberegner.dk/bmi?s=${SCRUBBED_VALUE}&h=1.82`,
    );
    expect(renset.request.url).not.toContain(HEMLIG_TILSTAND);
  });

  it("registrerer beforeSend på både server- og klientsiden", async () => {
    // The client init runs on import and cannot be booted inside vitest, so its
    // registration is asserted on the source. `kommentar-scanner.ts` does the
    // same for `fact-consistency.test.ts`, and stripping comments first keeps
    // the docblocks from satisfying the match on their own.
    const { stripKommentarer } = await import("./kommentar-scanner");
    for (const fil of ["sentry.server.config.ts", "instrumentation-client.ts"]) {
      const kilde = stripKommentarer(
        await readFile(new URL(`../${fil}`, import.meta.url), "utf8"),
      );
      expect(kilde, `${fil} skal kalde beforeSend med scrubSentryEvent`).toMatch(
        /beforeSend:\s*scrubSentryEvent/,
      );
    }
  });
});