import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { TIMETRACK_TIPS, timetrackUrl } from "./timetrack-links";

describe("timetrack links", () => {
  test("urls carry the UTM parameters", () => {
    const u = new URL(timetrackUrl("/timepris", "x"));
    expect(u.origin).toBe("https://timetrack.dk");
    expect(u.searchParams.get("utm_source")).toBe("minberegner");
    expect(u.searchParams.get("utm_medium")).toBe("referral");
    expect(u.searchParams.get("utm_campaign")).toBe("sostersites");
  });

  test("anchor texts and target pages vary", () => {
    const tips = Object.values(TIMETRACK_TIPS);
    expect(new Set(tips.map((t) => t.anchor)).size).toBe(tips.length);
    expect(new Set(tips.map((t) => t.path)).size).toBe(tips.length);
  });

  test("each page uses at most one contextual tip and footer has no nofollow", () => {
    for (const p of ["timepris", "moms", "loen-konverter"]) {
      const src = readFileSync(path.join(process.cwd(), `src/app/${p}/page.tsx`), "utf8");
      expect((src.match(/<TimeTrackTipBox/g) ?? []).length).toBe(1);
    }
    const footer = readFileSync(path.join(process.cwd(), "src/components/Footer.tsx"), "utf8");
    expect(footer).toContain("https://timetrack.dk/?utm_source=minberegner");
    expect(footer).not.toContain("nofollow");
  });
});
