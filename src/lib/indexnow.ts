import type { DomainConfig } from "./domain-config";
import { getAllDomainConfigs, normalizeHostname } from "./domain-config";
import { getRouteDecision } from "./routing";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;
const DEFAULT_TIMEOUT_MS = 5_000;
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export type IndexNowEnv = Record<string, string | undefined>;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowTarget {
  baseUrl: string;
  url: string;
}

export type IndexNowResult =
  | { status: "skipped"; reason: "disabled" | "missing-key" }
  | {
      status: "accepted";
      httpStatus: 200 | 202;
      urlCount: number;
    }
  | {
      status: "rate-limited";
      httpStatus: 429;
      retryAfter: string | null;
    }
  | {
      status: "failed";
      reason: "invalid-key" | "invalid-url" | "http" | "network" | "timeout";
      httpStatus?: number;
    };

interface SubmitIndexNowOptions {
  env?: IndexNowEnv;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface CanonicalUrl {
  config: DomainConfig;
  url: string;
}

function getLiveDomainConfig(hostname: string): DomainConfig | undefined {
  const normalizedHostname = normalizeHostname(hostname);
  return getAllDomainConfigs().find(
    (config) => new URL(config.baseUrl).hostname === normalizedHostname,
  );
}

function parseCanonicalUrl(
  rawUrl: string,
  allowUnavailable = false,
): CanonicalUrl | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const config = getLiveDomainConfig(url.hostname);
  if (
    rawUrl.includes("?") ||
    rawUrl.includes("#") ||
    !config ||
    url.protocol !== "https:" ||
    url.origin !== config.baseUrl ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    return null;
  }

  if (
    !allowUnavailable &&
    getRouteDecision(config, url.pathname).type !== "allow"
  ) {
    return null;
  }

  return {
    config,
    url: url.pathname === "/" ? config.baseUrl : url.toString(),
  };
}

export function isValidIndexNowKey(value: string | undefined): value is string {
  return Boolean(value && INDEXNOW_KEY_PATTERN.test(value));
}

export function getIndexNowKey(
  env: IndexNowEnv = process.env,
): string | undefined {
  return env.INDEXNOW_API_KEY || undefined;
}

export function parseIndexNowTarget(
  rawUrl: string,
  allowUnavailable = false,
): IndexNowTarget | null {
  const parsed = parseCanonicalUrl(rawUrl, allowUnavailable);
  return parsed
    ? { baseUrl: parsed.config.baseUrl, url: parsed.url }
    : null;
}

export function buildIndexNowPayload({
  baseUrl,
  key,
  urls,
  allowUnavailable = false,
}: {
  baseUrl: string;
  key: string;
  urls?: readonly string[];
  allowUnavailable?: boolean;
}): IndexNowPayload | null {
  if (!isValidIndexNowKey(key)) return null;

  const base = parseCanonicalUrl(baseUrl);
  if (!base) return null;

  const urlList = [`${base.config.baseUrl}/sitemap.xml`];
  for (const rawUrl of urls ?? []) {
    const parsed = parseCanonicalUrl(rawUrl, allowUnavailable);
    if (!parsed || parsed.config.baseUrl !== base.config.baseUrl) {
      return null;
    }
    if (!urlList.includes(parsed.url)) urlList.push(parsed.url);
  }

  if (urlList.length > MAX_URLS_PER_REQUEST) return null;

  return {
    host: new URL(base.config.baseUrl).hostname,
    key,
    keyLocation: `${base.config.baseUrl}/${key}.txt`,
    urlList,
  };
}

export async function submitIndexNow(
  input: {
    baseUrl: string;
    urls?: readonly string[];
    allowUnavailable?: boolean;
  },
  options: SubmitIndexNowOptions = {},
): Promise<IndexNowResult> {
  const env = options.env ?? process.env;
  if (env.NODE_ENV !== "production" || env.INDEXNOW_ENABLED !== "true") {
    return { status: "skipped", reason: "disabled" };
  }

  const key = getIndexNowKey(env);
  if (!key) return { status: "skipped", reason: "missing-key" };
  if (!isValidIndexNowKey(key)) {
    return { status: "failed", reason: "invalid-key" };
  }

  const payload = buildIndexNowPayload({ ...input, key });
  if (!payload) return { status: "failed", reason: "invalid-url" };

  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await (options.fetchImpl ?? fetch)(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: abortController.signal,
    });

    if (response.status === 200 || response.status === 202) {
      return {
        status: "accepted",
        httpStatus: response.status,
        urlCount: payload.urlList.length,
      };
    }

    if (response.status === 429) {
      return {
        status: "rate-limited",
        httpStatus: 429,
        retryAfter: response.headers.get("retry-after"),
      };
    }

    return {
      status: "failed",
      reason: "http",
      httpStatus: response.status,
    };
  } catch (error) {
    const isTimeout =
      abortController.signal.aborted ||
      (error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError"));
    return { status: "failed", reason: isTimeout ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }
}
