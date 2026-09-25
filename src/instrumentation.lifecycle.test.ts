import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("INDEXNOW_ENABLED", "true");
  vi.stubEnv("INDEXNOW_API_KEY", "abc12345");
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("IndexNow instrumentation lifecycle", () => {
  test("submits each live domain at most once per process", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { register } = await import("./instrumentation");

    register();
    register();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      fetchMock.mock.calls.map(([endpoint]) => endpoint),
    ).toEqual([
      "https://api.indexnow.org/indexnow",
      "https://api.indexnow.org/indexnow",
    ]);
  });

  test("does nothing in the Edge instrumentation runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const { register } = await import("./instrumentation");

    register();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does nothing when production submission is not explicitly enabled", async () => {
    vi.stubEnv("INDEXNOW_ENABLED", "false");
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const { register } = await import("./instrumentation");

    register();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
