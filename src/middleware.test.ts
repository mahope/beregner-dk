import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { middleware, config } from "./middleware";

function makeRequest(hostname: string, path: string): NextRequest {
  return new NextRequest(`https://${hostname}${path}`, {
    headers: { host: hostname },
  });
}

describe("middleware locale routing", () => {
  test("forwards Swedish request context without redirecting canonical pages", () => {
    const response = middleware(makeRequest("beraknare.se", "/dato?from=test"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-locale")).toBe("se");
    expect(response.headers.get("x-middleware-request-x-locale")).toBe("se");
    expect(response.headers.get("location")).toBeNull();
  });

  test("keeps Danish canonical routes available in Denmark", () => {
    const response = middleware(makeRequest("minberegner.dk", "/loen-efter-skat"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-locale")).toBe("da");
  });

  test("returns a localized 404 path for DA-only routes in Sweden", () => {
    for (const path of ["/su", "/ugenummer", "/flyttebudget", "/boligsalg"]) {
      const response = middleware(makeRequest("beraknare.se", path));
      expect(response.status, path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(
        "https://beraknare.se/locale-unavailable"
      );
      expect(response.headers.get("x-middleware-request-x-hostname"), path).toBe(
        "beraknare.se"
      );
      expect(response.headers.get("x-middleware-request-x-locale"), path).toBe("se");
    }
  });

  test("returns a 404 path for Danish-only routes and sections in Norway", () => {
    for (const path of ["/boligstoette", "/blog/boligstoette-2026-nye-regler", "/kategori/bolig"]) {
      const response = middleware(makeRequest("beregner.no", path));
      expect(response.status, path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(
        "https://beregner.no/locale-unavailable"
      );
      expect(response.headers.get("x-middleware-request-x-locale"), path).toBe("no");
    }
  });

  test("returns a 404 path for SE-only routes in Denmark", () => {
    for (const path of ["/lon-efter-skatt", "/bolan"]) {
      const response = middleware(makeRequest("minberegner.dk", path));
      expect(response.status, path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(
        "https://minberegner.dk/locale-unavailable"
      );
    }
  });

  test("returns a 404 path for Danish-only sections in Sweden", () => {
    for (const path of ["/blog", "/blog/skat-2026-alt-du-skal-vide", "/kategori/bolig"]) {
      const response = middleware(makeRequest("beraknare.se", path));
      expect(response.status, path).toBe(404);
    }
  });

  test("redirects approved Swedish aliases in one hop with query intact", () => {
    const aliases = {
      "/loen-efter-skat": "/lon-efter-skatt",
      "/tidskalkylator": "/tidsberegner",
      "/datumkalkylator": "/dato",
      "/nedrakning": "/nedtaelling",
      "/leasingkalkylator": "/leasing",
    };

    for (const [alias, target] of Object.entries(aliases)) {
      const response = middleware(
        makeRequest("beraknare.se", `${alias}/?source=test&value=1`)
      );
      expect(response.status, alias).toBe(301);
      expect(response.headers.get("location"), alias).toBe(
        `https://beraknare.se${target}?source=test&value=1`
      );
    }
  });

  test("normalizes protocol, port, and www alias hosts", () => {
    const request = new NextRequest("http://www.beraknare.se:3100/nedrakning?x=1", {
      headers: { host: "www.beraknare.se:3100" },
    });
    const response = middleware(request);
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/nedtaelling?x=1"
    );
  });

  test("normalizes a trailing slash without adding a second redirect", () => {
    const response = middleware(
      makeRequest("beraknare.se", "/dato/?source=test&value=1")
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/dato?source=test&value=1"
    );
  });

  test("preserves API trailing-slash normalization", () => {
    const response = middleware(makeRequest("beraknare.se", "/api/health/"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/api/health"
    );
  });

  test("does not redirect an alias target again", () => {
    for (const path of ["/lon-efter-skatt", "/tidsberegner", "/dato", "/nedtaelling", "/leasing"]) {
      const response = middleware(makeRequest("beraknare.se", path));
      expect(response.status, path).toBe(200);
      expect(response.headers.get("location"), path).toBeNull();
    }
  });

  test("does not apply the Swedish alias to the Danish host", () => {
    const response = middleware(makeRequest("minberegner.dk", "/tidskalkylator"));
    expect(response.status).toBe(200);
  });

  test("handles a trailing-dot Swedish host as the same locale", () => {
    const response = middleware(makeRequest("beraknare.se.", "/su"));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://beraknare.se/locale-unavailable"
    );
  });

  test("includes API routes in middleware normalization", () => {
    expect(config.matcher).toContain("/api/:path*");
  });

  test("keeps local development routes unrestricted", () => {
    const response = middleware(makeRequest("localhost:3000", "/su"));
    expect(response.status).toBe(200);
  });
});
