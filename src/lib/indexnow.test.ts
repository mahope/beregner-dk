import { describe, expect, test, vi } from "vitest";
import {
  buildIndexNowPayload,
  isValidIndexNowKey,
  parseIndexNowTarget,
  submitIndexNow,
  type IndexNowEnv,
  type IndexNowPayload,
} from "./indexnow";

const KEY = "abc12345";
const enabledEnv: IndexNowEnv = {
  NODE_ENV: "production",
  INDEXNOW_ENABLED: "true",
  INDEXNOW_API_KEY: KEY,
};

function getRequestBody(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  const init = fetchMock.mock.calls[0]?.[1];
  return JSON.parse(String(init?.body)) as IndexNowPayload;
}

describe("IndexNow key validation", () => {
  test.each(["abc12345", "ABC-def-123", "a".repeat(128)])(
    "accepts %s",
    (key) => {
      expect(isValidIndexNowKey(key)).toBe(true);
    },
  );

  test.each(["short", "a".repeat(129), "abc_12345", "abc.12345", "abc 12345"])(
    "rejects %s",
    (key) => {
      expect(isValidIndexNowKey(key)).toBe(false);
    },
  );
});

describe("IndexNow payload", () => {
  test("adds the host sitemap before a changed URL", () => {
    const payload = buildIndexNowPayload({
      baseUrl: "https://minberegner.dk",
      key: KEY,
      urls: ["https://minberegner.dk/procent"],
    });

    expect(payload).toEqual({
      host: "minberegner.dk",
      key: KEY,
      keyLocation: "https://minberegner.dk/abc12345.txt",
      urlList: [
        "https://minberegner.dk/sitemap.xml",
        "https://minberegner.dk/procent",
      ],
    });
  });

  test("deduplicates URLs and supports multiple changed URLs", () => {
    const payload = buildIndexNowPayload({
      baseUrl: "https://beraknare.se",
      key: KEY,
      urls: [
        "https://beraknare.se/dato",
        "https://beraknare.se/sitemap.xml",
        "https://beraknare.se/dato",
      ],
    });

    expect(payload?.urlList).toEqual([
      "https://beraknare.se/sitemap.xml",
      "https://beraknare.se/dato",
    ]);
  });

  test("rejects empty query and fragment delimiters even for deleted URLs", () => {
    expect(
      parseIndexNowTarget("https://minberegner.dk/procent?", true),
    ).toBeNull();
    expect(
      parseIndexNowTarget("https://minberegner.dk/procent#", true),
    ).toBeNull();
  });

  test.each([
    "http://minberegner.dk/procent",
    "https://www.minberegner.dk/procent",
    "https://beraknare.se/dato",
    "https://minberegner.dk/procent?view=full",
    "https://minberegner.dk/procent#answer",
    "https://user:pass@minberegner.dk/procent",
    "https://beraknare.se/su",
    "https://minberegner.dk/procent/",
  ])("rejects a non-canonical or foreign URL: %s", (url) => {
    expect(
      buildIndexNowPayload({
        baseUrl: "https://minberegner.dk",
        key: KEY,
        urls: [url],
      }),
    ).toBeNull();
  });
});

describe("submitIndexNow", () => {
  test("posts JSON to the official endpoint and accepts 200", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const result = await submitIndexNow(
      {
        baseUrl: "https://minberegner.dk",
        urls: ["https://minberegner.dk/procent"],
      },
      { env: enabledEnv, fetchImpl: fetchMock },
    );

    expect(result).toEqual({
      status: "accepted",
      httpStatus: 200,
      urlCount: 2,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("https://api.indexnow.org/indexnow");
    expect(init).toMatchObject({
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    expect(init?.signal).toBeDefined();
    expect(getRequestBody(fetchMock).urlList).toEqual([
      "https://minberegner.dk/sitemap.xml",
      "https://minberegner.dk/procent",
    ]);
  });

  test("accepts 202", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 202 }),
    );

    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        { env: enabledEnv, fetchImpl: fetchMock },
      ),
    ).resolves.toEqual({
      status: "accepted",
      httpStatus: 202,
      urlCount: 1,
    });
  });

  test("returns 429 with Retry-After without retrying", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: { "Retry-After": "120" },
      }),
    );

    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        { env: enabledEnv, fetchImpl: fetchMock },
      ),
    ).resolves.toEqual({
      status: "rate-limited",
      httpStatus: 429,
      retryAfter: "120",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test.each([400, 403, 422, 500, 204])(
    "classifies HTTP %s as failed",
    async (httpStatus) => {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(null, { status: httpStatus }),
      );

      await expect(
        submitIndexNow(
          { baseUrl: "https://minberegner.dk" },
          { env: enabledEnv, fetchImpl: fetchMock },
        ),
      ).resolves.toEqual({
        status: "failed",
        reason: "http",
        httpStatus,
      });
    },
  );

  test("classifies network and upstream timeout failures", async () => {
    const networkMock = vi.fn<typeof fetch>().mockRejectedValue(
      new TypeError("network failed"),
    );
    const timeoutMock = vi.fn<typeof fetch>().mockRejectedValue(
      Object.assign(new Error("timed out"), { name: "TimeoutError" }),
    );

    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        { env: enabledEnv, fetchImpl: networkMock },
      ),
    ).resolves.toEqual({ status: "failed", reason: "network" });
    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        { env: enabledEnv, fetchImpl: timeoutMock },
      ),
    ).resolves.toEqual({ status: "failed", reason: "timeout" });
  });

  test("aborts a request when the configured timeout expires", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          });
        }),
    );

    try {
      const submission = submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        { env: enabledEnv, fetchImpl: fetchMock, timeoutMs: 50 },
      );
      await vi.advanceTimersByTimeAsync(50);
      await expect(submission).resolves.toEqual({
        status: "failed",
        reason: "timeout",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  test("skips disabled or missing-key production configuration", async () => {
    const fetchMock = vi.fn<typeof fetch>();

    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        {
          env: { ...enabledEnv, INDEXNOW_ENABLED: "false" },
          fetchImpl: fetchMock,
        },
      ),
    ).resolves.toEqual({ status: "skipped", reason: "disabled" });
    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        {
          env: { NODE_ENV: "production", INDEXNOW_ENABLED: "true" },
          fetchImpl: fetchMock,
        },
      ),
    ).resolves.toEqual({ status: "skipped", reason: "missing-key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("rejects invalid runtime configuration before fetch", async () => {
    const fetchMock = vi.fn<typeof fetch>();

    await expect(
      submitIndexNow(
        { baseUrl: "https://minberegner.dk" },
        {
          env: { ...enabledEnv, INDEXNOW_API_KEY: "invalid_key" },
          fetchImpl: fetchMock,
        },
      ),
    ).resolves.toEqual({ status: "failed", reason: "invalid-key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
