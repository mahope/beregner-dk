/**
 * The error Next.js itself throws for a malformed RSC router-state header,
 * produced by calling Next's own parser — never by writing the message here.
 *
 * A port that hardcodes the sentence dies quietly: the first Next upgrade that
 * rewords the message leaves the test asserting a string Next no longer throws,
 * while production starts reporting the noise again. Reading both the message
 * and the error code out of the installed framework means the tests fail the day
 * Next renumbers the code, and stay green the day it only rewrites the wording.
 *
 * Test-only: `src/lib/__fixtures__/` is never imported by app code.
 */
import { parseAndValidateFlightRouterState } from "next/dist/server/app-render/parse-and-validate-flight-router-state";

/**
 * A header that is not JSON: `%7B` decodes to `{`, which fails both `JSON.parse`
 * and Next's own schema. This is the exact throw site behind MINBEREGNER-1.
 */
export function nextRouterStateParseFejl(): Error {
  try {
    parseAndValidateFlightRouterState("%7B");
  } catch (fejl) {
    if (fejl instanceof Error) return fejl;
    throw new Error("Next's router-state-parser kastede et Error-lignende objekt");
  }
  throw new Error("Next's router-state-parser accepterede en ugyldig header");
}

/** The code Next hangs on the error: `"__NEXT_ERROR_CODE"`, e.g. `"E10"`. */
export function nextFejlkode(fejl: Error): string | undefined {
  const kode = (fejl as Error & { __NEXT_ERROR_CODE?: unknown }).__NEXT_ERROR_CODE;
  return typeof kode === "string" ? kode : undefined;
}