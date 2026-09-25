import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const appDir = join(__dirname);

function findPageFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...findPageFiles(path));
    } else if (entry === "page.tsx") {
      files.push(path);
    }
  }
  return files;
}

const pageFiles = findPageFiles(appDir);

const siteNames = ["MinBeregner.dk", "Beregner.no", "Beräknare.se"];

function titleLiterals(source: string): string[] {
  return [...source.matchAll(/\btitle:\s*(["'`])(.*?)\1/g)].map((match) => match[2]);
}

describe("metadata-titler", () => {
  test("der findes sider at undersøge", () => {
    expect(pageFiles.length).toBeGreaterThan(50);
  });

  test("ingen sidetitel indeholder et domænenavn, layoutets template tilføjer det", () => {
    const offenders: string[] = [];

    for (const file of pageFiles) {
      for (const title of titleLiterals(readFileSync(file, "utf8"))) {
        for (const siteName of siteNames) {
          if (title.includes(siteName)) {
            offenders.push(`${file.replace(appDir, "src/app")}: ${title}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  test("blogindlæg og blogindeks har titler uden dobbelt domænesuffiks", () => {
    const blogFiles = pageFiles.filter((file) => file.includes(`${join("app", "blog")}`));
    expect(blogFiles.length).toBeGreaterThan(20);

    for (const file of blogFiles) {
      for (const title of titleLiterals(readFileSync(file, "utf8"))) {
        expect(title, file.replace(appDir, "src/app")).not.toMatch(/\|\s*(MinBeregner|Beregner|Beräknare)\b/);
      }
    }
  });
});
