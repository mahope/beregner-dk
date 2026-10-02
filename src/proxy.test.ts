import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import {
  buildIndexNowPayload,
  getIndexNowKeyFromPathname,
} from "./lib/indexnow";
import { config, proxy } from "./proxy";

function makeRequest(hostname: string, path: string): NextRequest {
  return new NextRequest(`https://${hostname}${path}`, {
    headers: { host: hostname },
  });
}

describe("proxy locale routing", () => {
  test("forwards Swedish request context without redirecting canonical pages", () => {
    const response = proxy(makeRequest("beraknare.se", "/dato?from=test"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-locale")).toBe("se");
    expect(response.headers.get("x-middleware-request-x-locale")).toBe("se");
    expect(response.headers.get("location")).toBeNull();
  });

  test("keeps Danish canonical routes available in Denmark", () => {
    const response = proxy(makeRequest("minberegner.dk", "/loen-efter-skat"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-locale")).toBe("da");
  });

  test("returns a localized 404 path for DA-only routes in Sweden", () => {
    for (const path of ["/su", "/ugenummer", "/flyttebudget", "/boligsalg"]) {
      const response = proxy(makeRequest("beraknare.se", path));
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
      const response = proxy(makeRequest("beregner.no", path));
      expect(response.status, path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(
        "https://beregner.no/locale-unavailable"
      );
      expect(response.headers.get("x-middleware-request-x-locale"), path).toBe("no");
    }
  });

  test("returns a 404 path for SE-only routes in Denmark", () => {
    for (const path of ["/lon-efter-skatt", "/bolan"]) {
      const response = proxy(makeRequest("minberegner.dk", path));
      expect(response.status, path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(
        "https://minberegner.dk/locale-unavailable"
      );
    }
  });

  test("returns a 404 path for Danish-only sections in Sweden", () => {
    for (const path of ["/blog", "/blog/skat-2026-alt-du-skal-vide", "/kategori/bolig"]) {
      const response = proxy(makeRequest("beraknare.se", path));
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
      const response = proxy(
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
    const response = proxy(request);
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/nedtaelling?x=1"
    );
  });

  test("normalizes a trailing slash without adding a second redirect", () => {
    const response = proxy(
      makeRequest("beraknare.se", "/dato/?source=test&value=1")
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/dato?source=test&value=1"
    );
  });

  test("preserves API trailing-slash normalization", () => {
    const response = proxy(makeRequest("beraknare.se", "/api/health/"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://beraknare.se/api/health"
    );
  });

  test("does not redirect an alias target again", () => {
    for (const path of ["/lon-efter-skatt", "/tidsberegner", "/dato", "/nedtaelling", "/leasing"]) {
      const response = proxy(makeRequest("beraknare.se", path));
      expect(response.status, path).toBe(200);
      expect(response.headers.get("location"), path).toBeNull();
    }
  });

  test("does not apply the Swedish alias to the Danish host", () => {
    const response = proxy(makeRequest("minberegner.dk", "/tidskalkylator"));
    expect(response.status).toBe(200);
  });

  test("handles a trailing-dot Swedish host as the same locale", () => {
    const response = proxy(makeRequest("beraknare.se.", "/su"));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://beraknare.se/locale-unavailable"
    );
  });

  test("includes API routes in middleware normalization", () => {
    expect(config.matcher).toContain("/api/:path*");
  });

  test("keeps local development routes unrestricted", () => {
    const response = proxy(makeRequest("localhost:3000", "/su"));
    expect(response.status).toBe(200);
  });
});

describe("proxy IndexNow key file", () => {
  /**
   * `buildIndexNowPayload` sender `https://{host}/{key}.txt` som `keyLocation`,
   * og IndexNow henter den URL før den accepterer en eneste URL. Uden denne
   * rewrite er der intet, der svarer på den, så hver indsendelse bliver afvist
   * — for de domæner, der leverer næsten en tredjedel af trafikken.
   */
  test.each(["minberegner.dk", "beraknare.se"])(
    "rewrites the advertised key path to the key route: %s",
    (host) => {
      const response = proxy(makeRequest(host, "/abc12345.txt"));

      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://${host}/api/indexnow-key/abc12345`,
      );
      expect(response.headers.get("x-middleware-request-x-hostname")).toBe(host);
    },
  );

  test("rewrites before the locale decision, so Swedish and Danish both work", () => {
    for (const host of ["minberegner.dk", "beraknare.se"]) {
      const response = proxy(makeRequest(host, "/abc12345.txt"));
      expect(response.headers.get("x-middleware-rewrite"), host).not.toContain(
        "locale-unavailable",
      );
      expect(response.status, host).toBe(200);
    }
  });

  test("leaves a page-shaped path to the normal routing", () => {
    for (const path of [
      "/dato",
      "/procent",
      "/abc12345",
      "/abc_12345.txt",
      "/robots.txt",
      "/ads.txt",
    ]) {
      const response = proxy(makeRequest("minberegner.dk", path));
      expect(response.headers.get("x-middleware-rewrite"), path).toBeNull();
    }
  });

  /**
   * Rewrite'en kører før statiske filer, så et `public/*.txt` med otte teg eller
   * mere i stammen ville blive slugt. Nøglen er et env-værdi, som ikke må læses
   * i proxy'en — der ville den frosset ved build — så klassen lukkes her i stedet.
   */
  test("cannot shadow a static root file, because none has a key-shaped stem", () => {
    const publicDir = join(__dirname, "..", "public");
    const keyShaped = readdirSync(publicDir)
      .filter((name) => name.endsWith(".txt"))
      .filter((name) => getIndexNowKeyFromPathname(`/${name}`) !== null);

    expect(keyShaped).toEqual([]);
    expect(readdirSync(publicDir)).toContain("ads.txt");
  });

  /**
   * Hele kæden i én test: den URL, payload'en sender til api.indexnow.org, er
   * den URL, proxy'en svarer på. Det er den eneste assertion, der falder, hvis
   * nogen af de to sider flyttes — og den fejlede mod master, fordi ingen af
   * dem gjorde det samme.
   */
  test("answers the exact keyLocation the submission advertises", () => {
    const payload = buildIndexNowPayload({
      baseUrl: "https://minberegner.dk",
      key: "abc12345",
      urls: ["https://minberegner.dk/procent"],
    });
    const keyLocation = new URL(payload?.keyLocation ?? "");
    const response = proxy(
      makeRequest(keyLocation.host, keyLocation.pathname),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${keyLocation.origin}/api/indexnow-key/abc12345`,
    );
  });
});
