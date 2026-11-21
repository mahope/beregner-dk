import { afterEach, describe, expect, test, vi } from "vitest";
import { GET } from "./route";

const KEY = "abc12345";

async function requestKey(key: string) {
  return GET(new Request(`https://minberegner.dk/${key}.txt`), {
    params: Promise.resolve({ key }),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("IndexNow key route", () => {
  test("serves only the exact configured key as plain text", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("INDEXNOW_API_KEY", KEY);

    const response = await requestKey(KEY);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe(KEY);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("hides a missing, invalid, or different key", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("INDEXNOW_API_KEY", KEY);

    expect((await requestKey("different")).status).toBe(404);

    vi.stubEnv("INDEXNOW_API_KEY", "");
    expect((await requestKey(KEY)).status).toBe(404);

    vi.stubEnv("INDEXNOW_API_KEY", "invalid_key");
    expect((await requestKey("invalid_key")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
