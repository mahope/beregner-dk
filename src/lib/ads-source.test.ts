// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

test("AdSense-kode findes kun i annoncekomponenten og ads.txt", () => {
  const allowed = new Set(["src/components/ads/AdBanner.tsx", "public/ads.txt"]);
  const pattern = /adsbygoogle|ca-pub-|pagead2\.googlesyndication\.com/i;
  const unexpected = ["src", "public"].flatMap(filesIn).filter((path) =>
    !allowed.has(path) && !/\.test\.[jt]sx?$/.test(path) && pattern.test(readFileSync(path, "utf8")),
  );
  expect(unexpected).toEqual([]);
});
