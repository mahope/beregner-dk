import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDomainConfigForHost } from "@/lib/domain-config";
import { getRouteDecision } from "@/lib/routing";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "localhost";
  const domainConfig = getDomainConfigForHost(hostname);
  const locale = domainConfig?.locale || "da";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-hostname", hostname);

  const decision = getRouteDecision(domainConfig, request.nextUrl.pathname);

  if (decision.type === "redirect") {
    const requestUrl = new URL(request.nextUrl.toString());
    const redirectBase =
      domainConfig && !domainConfig.baseUrl.includes("localhost")
        ? domainConfig.baseUrl
        : request.nextUrl.origin;
    const redirectUrl = new URL(decision.destination, redirectBase);
    redirectUrl.search = requestUrl.search;
    redirectUrl.hash = requestUrl.hash;
    return NextResponse.redirect(redirectUrl, decision.status);
  }

  if (decision.type === "not-found") {
    const notFoundUrl = new URL(
      "/locale-unavailable",
      domainConfig?.baseUrl || request.nextUrl.origin
    );
    notFoundUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(notFoundUrl, {
      status: 404,
      request: { headers: requestHeaders },
    });
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-locale", locale);
  response.headers.set("x-hostname", hostname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    "/api/:path*",
  ],
};
