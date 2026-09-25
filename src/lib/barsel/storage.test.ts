import { describe, expect, test } from "vitest";
import { arbejdsgiverBesked } from "./arbejdsgiver";
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  gemPlan,
  indlaesPlan,
  migrer,
  saniterPlan,
  sletPlan,
} from "./storage";
import type { BarselsPlan } from "./types";

const fallback: BarselsPlan = {
  konstellation: "mor-far",
  datoType: "termin",
  dato: "2027-03-01",
  antalBoern: 1,
  adoptionUdland: false,
  naertstaaende: false,
  indlaeggelsesUger: 0,
  kommuneskatPct: 25,
  foraeldre: [
    {
      id: "a",
      navn: "Mor",
      beskaeftigelse: "loenmodtager",
      maanedsloen: 35000,
      ugentligeTimer: 37,
      loenUnderBarsel: [],
      ydelseMaaned: 0,
      udskudteUger: 0,
      perioder: [],
    },
    {
      id: "b",
      navn: "Far",
      beskaeftigelse: "loenmodtager",
      maanedsloen: 40000,
      ugentligeTimer: 37,
      loenUnderBarsel: [],
      ydelseMaaned: 0,
      udskudteUger: 0,
      perioder: [],
    },
  ],
};

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

class ThrowingStorage extends MemoryStorage {
  getItem(): string | null {
    throw new Error("SecurityError");
  }
  setItem(): void {
    throw new Error("QuotaExceededError");
  }
  removeItem(): void {
    throw new Error("SecurityError");
  }
}

describe("storage", () => {
  test("saves and loads a plan round-trip", () => {
    const store = new MemoryStorage();
    const plan: BarselsPlan = {
      ...fallback,
      foraeldre: [
        { ...fallback.foraeldre[0], navn: "Åse", perioder: [{ start: -4, slut: 10, type: "orlov" }] },
        fallback.foraeldre[1],
      ],
    };
    expect(gemPlan(plan, store)).toBe(true);
    const stored = JSON.parse(store.getItem(STORAGE_KEY)!);
    expect(stored.v).toBe(SCHEMA_VERSION);
    expect(indlaesPlan(fallback, store)).toEqual(plan);
  });

  test("returns null when nothing is stored or JSON is corrupt", () => {
    const store = new MemoryStorage();
    expect(indlaesPlan(fallback, store)).toBeNull();
    store.setItem(STORAGE_KEY, "{not json");
    expect(indlaesPlan(fallback, store)).toBeNull();
  });

  test("never throws when storage throws", () => {
    const store = new ThrowingStorage();
    expect(indlaesPlan(fallback, store)).toBeNull();
    expect(gemPlan(fallback, store)).toBe(false);
    expect(sletPlan(store)).toBe(false);
  });

  test("clears the plan", () => {
    const store = new MemoryStorage();
    gemPlan(fallback, store);
    expect(sletPlan(store)).toBe(true);
    expect(store.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("migration", () => {
  test("rejects data from a newer, unknown schema version", () => {
    expect(migrer({ v: SCHEMA_VERSION + 1, plan: fallback }, fallback)).toBeNull();
  });

  test("migrates a bare plan (version 0, e.g. from a share link)", () => {
    const bare = { ...fallback, konstellation: "solo", foraeldre: [fallback.foraeldre[0]] };
    const plan = migrer(bare, fallback)!;
    expect(plan.konstellation).toBe("solo");
    expect(plan.foraeldre).toHaveLength(1);
  });

  test("runs a chain of migrations in order", () => {
    const migreringer = {
      0: (d: Record<string, unknown>) => ({ v: 1, plan: d }),
      1: (d: Record<string, unknown>) => {
        const plan = d.plan as Record<string, unknown>;
        return { v: 2, plan: { ...plan, dato: plan.date } };
      },
    };
    const plan = migrer({ ...fallback, dato: undefined, date: "2027-06-01" }, fallback, migreringer, 2)!;
    expect(plan.dato).toBe("2027-06-01");
  });

  test("returns null when a migration step is missing", () => {
    expect(migrer({ v: 1, plan: fallback }, fallback, {}, 3)).toBeNull();
  });

  test("sanitises bad fields field by field", () => {
    const plan = saniterPlan(
      {
        konstellation: "ukendt",
        dato: "2027-02-31",
        antalBoern: 9,
        foraeldre: [
          {
            navn: 42,
            maanedsloen: -5,
            beskaeftigelse: "astronaut",
            perioder: [
              { start: 0, slut: 4, type: "orlov" },
              { start: 5, slut: 3, type: "orlov" },
              { start: 1, slut: 2, type: "ukendt" },
              { start: 6, slut: 8, type: "deltid", arbejdsProcent: 200 },
            ],
          },
        ],
      },
      fallback
    );
    expect(plan.konstellation).toBe("mor-far");
    expect(plan.dato).toBe("2027-03-01");
    expect(plan.antalBoern).toBe(4);
    expect(plan.foraeldre).toHaveLength(2);
    expect(plan.foraeldre[0].navn).toBe("Mor");
    expect(plan.foraeldre[0].maanedsloen).toBe(0);
    expect(plan.foraeldre[0].beskaeftigelse).toBe("loenmodtager");
    expect(plan.foraeldre[0].perioder).toEqual([
      { start: 0, slut: 4, type: "orlov" },
      { start: 6, slut: 8, type: "deltid", arbejdsProcent: 90 },
    ]);
    expect(plan.foraeldre[1]).toEqual(fallback.foraeldre[1]);
  });
});

describe("arbejdsgiver", () => {
  test("lists exact Danish dates for every period", () => {
    const text = arbejdsgiverBesked({
      navn: "Jonas",
      datoType: "termin",
      dato: "2027-01-04",
      adoption: false,
      udskudteUger: 0,
      perioder: [
        { fra: "2027-01-04", til: "2027-01-17", beskrivelse: "Fædreorlov (2 uger ved fødslen)" },
        { fra: "2027-05-03", til: "2027-05-03", beskrivelse: "Ferie" },
      ],
    });
    expect(text).toContain("Vores barn har termin mandag den 4. januar 2027.");
    expect(text).toContain(
      "- mandag den 4. januar 2027 til og med søndag den 17. januar 2027: Fædreorlov (2 uger ved fødslen)"
    );
    expect(text).toContain("- mandag den 3. maj 2027: Ferie");
    expect(text).toContain("flytter sig tilsvarende");
    expect(text.trim().endsWith("Jonas")).toBe(true);
  });

  test("handles adoption, postponed weeks and no periods", () => {
    const text = arbejdsgiverBesked({
      navn: "",
      datoType: "foedsel",
      dato: "2027-01-04",
      adoption: true,
      udskudteUger: 1,
      perioder: [],
    });
    expect(text).toContain("Vi modtog vores barn mandag den 4. januar 2027.");
    expect(text).toContain("udskyde 1 uge ");
    expect(text).toContain("endnu ikke lagt");
    expect(text).toContain("[dit navn]");
    expect(text).not.toContain("flytter sig");
  });

  test("solo parent and close relative get their own wording", () => {
    const base = { navn: "A", datoType: "foedsel" as const, dato: "2027-01-04", adoption: false, udskudteUger: 0, perioder: [] };
    expect(arbejdsgiverBesked({ ...base, solo: true })).toContain("Mit barn blev født");
    expect(arbejdsgiverBesked({ ...base, naertstaaende: true })).toContain("nærtstående familiemedlem (barselsloven § 23 c)");
  });
});
