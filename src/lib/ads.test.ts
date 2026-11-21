// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { ADSENSE_SCRIPT_URL, hasAdSenseVerificationScript } from "./ads";
import { getDomainConfigForHost } from "./domain-config";
import { getRouteDecision } from "./routing";

test("verifikationsscriptet sidder kun på det svenske site", () => {
  expect(hasAdSenseVerificationScript("se")).toBe(true);
  expect(hasAdSenseVerificationScript("da")).toBe(false);
  expect(hasAdSenseVerificationScript("no")).toBe(false);
  expect(ADSENSE_SCRIPT_URL).toBe(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1902871361369866",
  );
});

test("ads.txt har publisher-linjen og serveres uændret på begge domæner", () => {
  expect(readFileSync("public/ads.txt", "utf8")).toContain(
    "google.com, pub-1902871361369866, DIRECT, f08c47fec0942fa0",
  );
  for (const host of ["minberegner.dk", "beraknare.se"]) {
    expect(getRouteDecision(getDomainConfigForHost(host), "/ads.txt")).toEqual({ type: "allow" });
  }
});

test("layoutet renderer verifikationsscriptet i head bag hasAdSenseVerificationScript, uden flag", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const head = layout.slice(layout.indexOf("<head"), layout.indexOf("</head>"));
  expect(head).toMatch(
    /hasAdSenseVerificationScript\(domainConfig\.locale\) && \(\s*<script async src=\{ADSENSE_SCRIPT_URL\} crossOrigin="anonymous" \/>/,
  );
  expect(head).not.toContain("isAdSenseEnabled");
});
