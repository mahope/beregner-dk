import * as Sentry from "@sentry/nextjs";
import {
  scrubSentryEvent,
  SENTRY_DATA_COLLECTION,
  SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
  sentryDsn,
  sentryIsEnabled,
  SENTRY_TRACES_SAMPLE_RATE,
} from "@/lib/sentry-config";

// Next.js runs this file once in the browser before hydration.
Sentry.init({
  dsn: sentryDsn(),
  enabled: sentryIsEnabled(),
  dataCollection: SENTRY_DATA_COLLECTION,
  replaysSessionSampleRate: SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  beforeSend: scrubSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
