import * as Sentry from "@sentry/nextjs";
import {
  scrubSentryEvent,
  SENTRY_DATA_COLLECTION,
  sentryDsn,
  sentryIsEnabled,
  SENTRY_TRACES_SAMPLE_RATE,
} from "@/lib/sentry-config";

let initialised = false;

/**
 * Called from `src/instrumentation.ts`'s `register()`, which Next runs once per
 * server process. `init()` is not idempotent, so the flag guards against the
 * double register that happens when a dev server restarts the runtime.
 */
export function initSentryServer(): boolean {
  if (initialised || !sentryIsEnabled()) return false;

  initialised = true;
  Sentry.init({
    dsn: sentryDsn(),
    dataCollection: SENTRY_DATA_COLLECTION,
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    beforeSend: scrubSentryEvent,
  });
  return true;
}

/** Test-only: lets a test start from a clean "never initialised" state. */
export function resetSentryServerForTests(): void {
  initialised = false;
}
