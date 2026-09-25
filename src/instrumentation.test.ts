import { describe, expect, test, vi } from "vitest";
import { submitDeploymentIndexNow } from "./instrumentation";
import type { IndexNowEnv, IndexNowPayload } from "./lib/indexnow";

const env: IndexNowEnv = {
  NODE_ENV: "production",
  INDEXNOW_ENABLED: "true",
  INDEXNOW_API_KEY: "abc12345",
};

function getPayloads(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  return fetchMock.mock.calls.map(([, init]) =>
    JSON.parse(String(init?.body)) as IndexNowPayload,
  );
}

describe("IndexNow deployment submission", () => {
  test("submits both live domains with their complete canonical sitemap", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const results = await submitDeploymentIndexNow({
      env,
      fetchImpl: fetchMock,
      nodeEnv: "production",
    });

    expect(results).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const payloads = getPayloads(fetchMock);
    const danish = payloads.find(
      (payload) => payload.host === "minberegner.dk",
    );
    const swedish = payloads.find((payload) => payload.host === "beraknare.se");
    expect(danish?.urlList).toContain(
      "https://minberegner.dk/sitemap.xml",
    );
    expect(danish?.urlList).toContain("https://minberegner.dk/procent");
    expect(swedish?.urlList).toContain("https://beraknare.se/sitemap.xml");
    expect(swedish?.urlList).toContain("https://beraknare.se/dato");
    expect(swedish?.urlList).not.toContain("https://beraknare.se/su");
    expect(payloads.some((payload) => payload.host === "beregner.no")).toBe(
      false,
    );
  });

  test("does not submit outside explicitly enabled production", async () => {
    const fetchMock = vi.fn<typeof fetch>();

    await expect(
      submitDeploymentIndexNow({
        env,
        fetchImpl: fetchMock,
        nodeEnv: "test",
      }),
    ).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("attempts every live domain when one submission fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));

    const results = await submitDeploymentIndexNow({
      env,
      fetchImpl: fetchMock,
      nodeEnv: "production",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results.map((result) => result.result.status)).toEqual([
      "failed",
      "accepted",
    ]);
  });
});
