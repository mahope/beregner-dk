/**
 * Shared Sentry setup for minberegner.dk.
 *
 * The DSN is an ingest endpoint, not a credential, so it may live in the code —
 * an env var can still point the same build at another project. Three rules
 * live here and nowhere else, because breaking any of them either ships Danish
 * users' data abroad or costs money:
 *
 *  - only production reports, so `next dev` never fills the project with noise,
 *  - no personal data and no session replay, which needs consent we do not ask
 *    for — see SENTRY_DATA_COLLECTION below,
 *  - no source maps, because uploading them needs an auth token we do not have
 *    (❓ open in IMPLEMENTATION_PLAN.md). That is a build-time setting, so it
 *    lives in `next.config.ts` and not in these runtime options.
 *
 * Both the client and the server import this module, so the rules cannot drift
 * apart between the two runtimes.
 */
export const FALLBACK_SENTRY_DSN =
  "https://bd169c02c4b43044caafd04bfd324a72@o1087332.ingest.us.sentry.io/4512180031717376";

export const SENTRY_TRACES_SAMPLE_RATE = 0.1;

/** Session Replay records the user's screen. It needs consent we never ask for. */
export const SENTRY_REPLAYS_SESSION_SAMPLE_RATE = 0;

/**
 * Sentry v11 dropped `sendDefaultPii` and, worse, collects *more* by default
 * than v10 did with PII off: cookies, all HTTP request/response headers, HTTP
 * bodies, URL query parameters, database values, queue arguments and the local
 * variable values of every stack frame. On a Danish site with cookie consent,
 * that is other users' data leaving the country over a page load.
 *
 * So every leaf is switched off explicitly rather than relying on a default,
 * and `sentry-config.test.ts` fails if one is ever added back as `true`.
 */
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: false, response: false },
  httpBodies: [],
  urlQueryParams: false,
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
};

type SentryEnv = Partial<
  Pick<NodeJS.ProcessEnv, "NEXT_PUBLIC_SENTRY_DSN" | "NODE_ENV">
>;

export function sentryDsn(env: SentryEnv = process.env): string {
  const configured = env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return configured ? configured : FALLBACK_SENTRY_DSN;
}

export function sentryIsEnabled(
  env: Pick<SentryEnv, "NODE_ENV"> = process.env,
): boolean {
  return env.NODE_ENV === "production";
}

/**
 * `?s=` carries a calculator's entire state (see `calculation-state-privacy.ts`),
 * and the scrub that moves it into session history runs in the browser. A crash
 * in the first server render can therefore still put the user's numbers in a
 * URL. Strip the value before the event leaves here.
 *
 * Sentry also reports the bare query string, which has no `?` — hence the `^`
 * alternative — and the privacy script may leave the state in the fragment,
 * hence `#`. All three are covered.
 */
const CALCULATION_STATE_KEY = "s";

const CALCULATION_STATE_PARAM = /([?&#]|^)s=[^&#]*/g;

export const SCRUBBED_VALUE = "[skjult]";

export function scrubSentryUrl(url: string): string {
  return url.replace(
    CALCULATION_STATE_PARAM,
    (_match, prefix: string) => `${prefix}s=${SCRUBBED_VALUE}`,
  );
}

export interface SentryRequestLike {
  url?: string;
  /** Sentry types this as `string | QueryParams`, so every shape must survive. */
  query_string?: string | Record<string, string> | [string, string][];
}

export interface SentryEventLike {
  request?: SentryRequestLike;
}

export function scrubSentryEvent<T extends SentryEventLike>(event: T): T {
  const request = event.request;
  if (!request) return event;
  if (request.url) request.url = scrubSentryUrl(request.url);

  const query = request.query_string;
  if (typeof query === "string") {
    request.query_string = scrubSentryUrl(query);
  } else if (Array.isArray(query)) {
    for (const pair of query) {
      if (pair[0] === CALCULATION_STATE_KEY) pair[1] = SCRUBBED_VALUE;
    }
  } else if (query) {
    if (CALCULATION_STATE_KEY in query) query[CALCULATION_STATE_KEY] = SCRUBBED_VALUE;
  }
  return event;
}
