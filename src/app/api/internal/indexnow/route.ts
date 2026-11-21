import { timingSafeEqual } from "node:crypto";
import { buildSitemap } from "@/app/sitemap";
import { getDomainConfigForHost } from "@/lib/domain-config";
import {
  parseIndexNowTarget,
  submitIndexNow,
  type IndexNowResult,
} from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 4_096;
const MIN_TRIGGER_TOKEN_LENGTH = 32;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const DEFAULT_RETRY_AFTER_SECONDS = 60;

interface RateLimitState {
  timestamps: number[];
  blockedUntil: number;
}

type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 };

const rateLimits = new Map<string, RateLimitState>();
const inFlightSubmissions = new Map<string, Promise<IndexNowResult>>();

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit,
) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  return Response.json(body, { status, headers: responseHeaders });
}

function getBearerToken(request: Request): string | null {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function tokensMatch(provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return (
    providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes)
  );
}

async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  if (!request.body) return { ok: false, status: 400 };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { ok: false, status: 400 };
  }
}

function getRetryAfterSeconds(value: string | null): number {
  if (value) {
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds;
    const date = Date.parse(value);
    if (Number.isFinite(date)) {
      return Math.max(0, Math.ceil((date - Date.now()) / 1_000));
    }
  }
  return DEFAULT_RETRY_AFTER_SECONDS;
}

function consumeRateLimit(host: string): number | null {
  const now = Date.now();
  const state = rateLimits.get(host) ?? { timestamps: [], blockedUntil: 0 };
  rateLimits.set(host, state);

  if (state.blockedUntil > now) {
    return Math.max(1, Math.ceil((state.blockedUntil - now) / 1_000));
  }

  state.timestamps = state.timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  if (state.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.max(
      1,
      Math.ceil(
        (state.timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1_000,
      ),
    );
    state.blockedUntil = now + retryAfter * 1_000;
    return retryAfter;
  }

  state.timestamps.push(now);
  return null;
}

function applyUpstreamCooldown(
  host: string,
  retryAfter: string | null,
): void {
  const state = rateLimits.get(host);
  if (!state) return;
  state.blockedUntil = Math.max(
    state.blockedUntil,
    Date.now() + getRetryAfterSeconds(retryAfter) * 1_000,
  );
}

function isPublishedTarget(url: string): boolean {
  const domainConfig = getDomainConfigForHost(new URL(url).hostname);
  return domainConfig
    ? buildSitemap(domainConfig).some((entry) => String(entry.url) === url)
    : false;
}

function mapResult(result: IndexNowResult): Response {
  if (result.status === "accepted") {
    return jsonResponse(
      {
        status: "accepted",
        upstreamStatus: result.httpStatus,
        urlCount: result.urlCount,
      },
      200,
    );
  }

  if (result.status === "rate-limited") {
    const retryAfter = getRetryAfterSeconds(result.retryAfter);
    return jsonResponse(
      { status: "rate-limited", upstreamStatus: result.httpStatus },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  if (result.status === "skipped") {
    return jsonResponse({ status: "unavailable", reason: result.reason }, 503);
  }

  if (result.reason === "invalid-url") {
    return jsonResponse({ status: "failed", reason: "invalid-url" }, 400);
  }

  if (result.reason === "invalid-key") {
    return jsonResponse({ status: "unavailable", reason: "invalid-key" }, 503);
  }

  return jsonResponse(
    {
      status: "failed",
      reason: "upstream",
      ...(result.httpStatus ? { upstreamStatus: result.httpStatus } : {}),
    },
    502,
  );
}

export async function POST(request: Request) {
  const configuredToken = process.env.INDEXNOW_TRIGGER_TOKEN;
  if (
    !configuredToken ||
    configuredToken.length < MIN_TRIGGER_TOKEN_LENGTH ||
    configuredToken === process.env.INDEXNOW_API_KEY
  ) {
    return jsonResponse({ status: "unavailable" }, 503);
  }

  const providedToken = getBearerToken(request);
  if (!providedToken || !tokensMatch(providedToken, configuredToken)) {
    return jsonResponse(
      { status: "unauthorized" },
      401,
      { "WWW-Authenticate": "Bearer" },
    );
  }

  const contentLengthValue = request.headers.get("content-length");
  if (contentLengthValue !== null) {
    const contentLength = Number(contentLengthValue);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      return jsonResponse({ status: "invalid-request" }, 400);
    }
    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ status: "payload-too-large" }, 413);
    }
  }

  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) {
    return jsonResponse(
      { status: parsedBody.status === 413 ? "payload-too-large" : "invalid-request" },
      parsedBody.status,
    );
  }

  const body = parsedBody.value;
  if (
    !body ||
    typeof body !== "object" ||
    !("url" in body) ||
    typeof body.url !== "string"
  ) {
    return jsonResponse({ status: "invalid-request" }, 400);
  }

  let deleted = false;
  if ("deleted" in body) {
    if (typeof body.deleted !== "boolean") {
      return jsonResponse({ status: "invalid-request" }, 400);
    }
    deleted = body.deleted;
  }

  const target = parseIndexNowTarget(body.url, deleted);
  if (!target || (!deleted && !isPublishedTarget(target.url))) {
    return jsonResponse({ status: "invalid-url" }, 400);
  }

  const existingSubmission = inFlightSubmissions.get(target.url);
  if (existingSubmission) return mapResult(await existingSubmission);

  const host = new URL(target.baseUrl).hostname;
  const retryAfter = consumeRateLimit(host);
  if (retryAfter !== null) {
    return jsonResponse({ status: "rate-limited" }, 429, {
      "Retry-After": String(retryAfter),
    });
  }

  const submission = submitIndexNow({
    baseUrl: target.baseUrl,
    urls: [target.url],
    allowUnavailable: deleted,
  });
  inFlightSubmissions.set(target.url, submission);

  let result: IndexNowResult;
  try {
    result = await submission;
  } finally {
    if (inFlightSubmissions.get(target.url) === submission) {
      inFlightSubmissions.delete(target.url);
    }
  }

  if (result.status === "rate-limited") {
    applyUpstreamCooldown(host, result.retryAfter);
  }

  return mapResult(result);
}
