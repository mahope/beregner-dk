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

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

/** The names in a `{ a, b as c, type D }` list: [imported/local name, exported/alias name], types skipped. */
function braceNames(list: string): [string, string][] {
  return stripComments(list)
    .split(",")
    .map((raw) => raw.trim())
    .filter((item) => item && !item.startsWith("type "))
    .map((item) => {
      const [name, alias] = item.split(/\s+as\s+/).map((s) => s.trim());
      return [name as string, (alias ?? name) as string];
    });
}

/** Non-component value exports of a client module (functions, classes, constants, data). */
function nonComponentExports(file: string): Set<string> {
  const body = stripComments(text.get(file) ?? "");
  const names = new Set<string>();
  for (const m of body.matchAll(/export\s+(?:async\s+)?(function\*?|class|const|let|var)\s+(\w+)/g)) {
    const name = m[2] as string;
    // A function with a capital first letter is a component (also FAQ); a constant only when PascalCase.
    const component =
      m[1] === "class" ? false : m[1]?.startsWith("function") ? /^[A-Z]/.test(name) : isComponentName(name);
    if (!component) names.add(name);
  }
  // `export { helper, other as alias }` at the bottom of a file (without `from`).
  for (const m of body.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) {
    for (const [, exported] of braceNames(m[1] as string)) if (!isComponentName(exported)) names.add(exported);
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
      // import { a }, import Default, { a }, import * as ns, export { a } from, export * from (also multi-line).
      for (const m of stripComments(body).matchAll(
        /\b(import|export)\s+(type\s+)?([\w\s,*{}$]*?)\s*from\s*["']([^"']+)["']/g,
      )) {
        if (m[2]) continue;
        const target = resolveImport(file, m[4] as string);
        if (!target || !clientModules.has(target)) continue;
        const forbidden = nonComponentExports(target);
        const where = `${relative(src, file)}: %s from ${relative(src, target)}`;
        const clause = m[3] as string;
        // A namespace import or a star re-export hands every export over, also the helpers.
        if (/\*/.test(clause) && forbidden.size) offenders.push(where.replace("%s", `* (${[...forbidden].join(", ")})`));
        const brace = clause.match(/\{([^}]*)\}/);
        for (const [name] of brace ? braceNames(brace[1] as string) : [])
          if (forbidden.has(name)) offenders.push(where.replace("%s", name));
      }
      // await import("<client module>") in a server module: only the default (a component) may be used.
      for (const m of body.matchAll(/import\(\s*["']([^"']+)["']\s*\)\s*\)?\s*\.\s*(\w+)/g)) {
        const target = resolveImport(file, m[1] as string);
        if (target && clientModules.has(target) && nonComponentExports(target).has(m[2] as string))
          offenders.push(`${relative(src, file)}: ${m[2]} from ${relative(src, target)} (dynamic import)`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
