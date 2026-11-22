import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// A module marked "use client" becomes a client reference on the server: every export, also plain functions and
// constants, is replaced by a proxy. A server component that calls such a function throws "Attempted to call X()
// from the server but X is on the client" (Sentry MINBEREGNER-4: partnerAdsLink() in app/forbrugslaan/page.tsx).
// Client modules may only hand components to the server. Shared helpers and data belong in a module without
// "use client".

const src = join(__dirname, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

const isClient = (text: string) => /^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*["']use client["']/.test(text);
const isComponentName = (name: string) => /^[A-Z][A-Za-z0-9]*$/.test(name) && /[a-z]/.test(name);

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(src, spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(from), spec);
  else return null;
  for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const files = walk(src);
const text = new Map(files.map((f) => [f, readFileSync(f, "utf-8")]));
const clientModules = new Set(files.filter((f) => isClient(text.get(f) ?? "")));

/** Non-component value exports of a client module (functions, constants, data). */
function nonComponentExports(file: string): Set<string> {
  const names = new Set<string>();
  for (const m of (text.get(file) ?? "").matchAll(/export\s+(?:async\s+)?(function\*?|const|let|var)\s+(\w+)/g)) {
    const name = m[2] as string;
    // A function with a capital first letter is a component (also FAQ); a constant only when PascalCase.
    const component = m[1] === "function" ? /^[A-Z]/.test(name) : isComponentName(name);
    if (!component) names.add(name);
  }
  return names;
}

describe("client boundary", () => {
  it("finds the client modules", () => {
    expect([...clientModules].map((f) => relative(src, f))).toContain("components/AffiliateBox.tsx");
  });

  it("server modules import only components from client modules", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const body = text.get(file) ?? "";
      if (isClient(body)) continue;
      for (const m of body.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
        if (m[1]) continue;
        const target = resolveImport(file, m[3] as string);
        if (!target || !clientModules.has(target)) continue;
        const forbidden = nonComponentExports(target);
        for (const raw of (m[2] as string).split(",")) {
          const item = raw.trim();
          if (!item || item.startsWith("type ")) continue;
          const name = item.split(/\s+as\s+/)[0] as string;
          if (forbidden.has(name)) offenders.push(`${relative(src, file)}: ${name} from ${relative(src, target)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
