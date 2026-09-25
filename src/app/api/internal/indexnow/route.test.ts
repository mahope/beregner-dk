import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const API_KEY = "abc12345";
const TRIGGER_TOKEN = "trigger-token-with-at-least-32-characters";
const CHANGED_URL = "https://minberegner.dk/procent";
const MAX_BODY_TEST_SIZE = 5_000;

function createRequest(
  body: unknown = { url: CHANGED_URL },
  token: string | null = TRIGGER_TOKEN,
) {
  const serialized = JSON.stringify(body);
  return new Request("https://minberegner.dk/api/internal/indexnow", {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(serialized)),
    },
    body: serialized,
  });
}

let post: typeof import("./route").POST;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(async () => {
  vi.resetModules();
  post = (await import("./route")).POST;
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("INDEXNOW_ENABLED", "true");
  vi.stubEnv("INDEXNOW_API_KEY", API_KEY);
  vi.stubEnv("INDEXNOW_TRIGGER_TOKEN", TRIGGER_TOKEN);
  fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(null, { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("internal IndexNow trigger", () => {
  test("submits the sitemap and one canonical changed URL", async () => {
    const response = await post(createRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.urlList).toEqual([
      "https://minberegner.dk/sitemap.xml",
      CHANGED_URL,
    ]);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      status: "accepted",
      upstreamStatus: 200,
      urlCount: 2,
    });
    expect(JSON.stringify(responseBody)).not.toContain(API_KEY);
  });

  test("rejects missing or invalid authentication without fetching", async () => {
    const response = await post(createRequest(undefined, null));
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(
      (await post(createRequest(undefined, "wrong-token"))).status,
    ).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("requires separate trigger-token configuration", async () => {
    vi.stubEnv("INDEXNOW_TRIGGER_TOKEN", "");

    const response = await post(createRequest());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does not accept the public IndexNow key as the trigger token", async () => {
    vi.stubEnv("INDEXNOW_TRIGGER_TOKEN", TRIGGER_TOKEN);
    vi.stubEnv("INDEXNOW_API_KEY", TRIGGER_TOKEN);

    const response = await post(createRequest());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does not submit while production submission is disabled", async () => {
    vi.stubEnv("INDEXNOW_ENABLED", "false");

    const response = await post(createRequest());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    {},
    { url: 42 },
    { url: "https://minberegner.dk/procent?view=full" },
    { url: "https://minberegner.dk/procent?", deleted: true },
    { url: "https://minberegner.dk/procent#answer", deleted: true },
    { url: "https://beraknare.se/tidskalkylator" },
    { url: "https://beraknare.se/su" },
    { url: "https://minberegner.dk/procent/" },
  ])("rejects a non-canonical request body: %s", async (body) => {
    const response = await post(createRequest(body));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("accepts an explicitly deleted unavailable URL", async () => {
    const deletedUrl = "https://beraknare.se/tidskalkylator";
    const response = await post(
      createRequest({ url: deletedUrl, deleted: true }),
    );

    expect(response.status).toBe(200);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.urlList).toEqual([
      "https://beraknare.se/sitemap.xml",
      deletedUrl,
    ]);
  });

  test("rejects oversized and malformed request bodies", async () => {
    const oversized = createRequest();
    oversized.headers.set("Content-Length", "5000");

    expect((await post(oversized)).status).toBe(413);

    const streamedOversized = new Request(
      "https://minberegner.dk/api/internal/indexnow",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TRIGGER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: CHANGED_URL,
          padding: "x".repeat(MAX_BODY_TEST_SIZE),
        }),
      },
    );
    expect((await post(streamedOversized)).status).toBe(413);

    const malformed = new Request(
      "https://minberegner.dk/api/internal/indexnow",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TRIGGER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: "not-json",
      },
    );
    expect((await post(malformed)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("maps upstream 429 and Retry-After", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: { "Retry-After": "180" },
      }),
    );

    const response = await post(createRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("180");
    await expect(response.json()).resolves.toEqual({
      status: "rate-limited",
      upstreamStatus: 429,
    });

    const cooldownResponse = await post(
      createRequest({ url: "https://minberegner.dk/dato" }),
    );
    expect(cooldownResponse.status).toBe(429);
    expect(cooldownResponse.headers.get("retry-after")).toBe("180");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("deduplicates concurrent submissions for the same URL", async () => {
    let resolveFetch:
      | ((response: Response | PromiseLike<Response>) => void)
      | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const first = post(createRequest());
    const second = post(createRequest());
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    resolveFetch?.(new Response(null, { status: 200 }));

    const responses = await Promise.all([first, second]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("caps authenticated submissions per host", async () => {
    const slugs = [
      "procent",
      "dato",
      "moms",
      "bmi",
      "alder",
      "pension",
      "braendstof",
      "kalorier",
      "boliglaan",
      "renteberegner",
      "tidsberegner",
    ];

    const responses = [];
    for (const slug of slugs) {
      responses.push(
        await post(
          createRequest({ url: `https://minberegner.dk/${slug}` }),
        ),
      );
    }

    expect(responses.slice(0, 10).every((response) => response.status === 200)).toBe(
      true,
    );
    expect(responses[10].status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });

  test("maps upstream failures without exposing the key", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const response = await post(createRequest());

    expect(response.status).toBe(502);
    const serialized = JSON.stringify(await response.json());
    expect(serialized).not.toContain(API_KEY);
    expect(serialized).not.toContain(TRIGGER_TOKEN);
  });
});
