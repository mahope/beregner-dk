import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Domain → locale mapping for multi-domain setup.
 * Middleware sets x-locale and x-hostname headers so server components
 * can read the current locale without client-side JS.
 */
const domainLocaleMap: Record<string, string> = {
  "minberegner.dk": "da",
  "www.minberegner.dk": "da",
  "beregner.no": "no",
  "www.beregner.no": "no",
  "beraknare.se": "se",
  "www.beraknare.se": "se",
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "localhost";
  const domain = hostname.split(":")[0]; // strip port
  const locale = domainLocaleMap[domain] || "da";

  const response = NextResponse.next();

  // Set headers for server components to read
  response.headers.set("x-locale", locale);
  response.headers.set("x-hostname", hostname);

  return response;
}

export const config = {
  // Run on all routes except static files and api routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
