import { afterEach, expect, test, vi } from "vitest";
import nextConfig from "../next.config";
import { GET } from "./app/api/indexnow-key/[key]/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("rewrites the public IndexNow key path to the runtime key route", async () => {
  const rewrites =
    typeof nextConfig.rewrites === "function"
      ? await nextConfig.rewrites()
      : nextConfig.rewrites;

  expect(rewrites).toEqual([
    {
      source: "/:key.txt",
      destination: "/api/indexnow-key/:key",
    },
  ]);

  vi.stubEnv("INDEXNOW_API_KEY", "abc12345");
  const response = await GET(new Request("https://minberegner.dk/abc12345.txt"), {
    params: Promise.resolve({ key: "abc12345" }),
  });

  expect(response.status).toBe(200);
  expect(await response.text()).toBe("abc12345");
});
