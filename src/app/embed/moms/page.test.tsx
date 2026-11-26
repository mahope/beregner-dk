import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import MomsBeregner from "@/components/MomsBeregner";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

test("the embed page never includes the CVR panel", () => {
  const kilde = readFileSync(path.join(__dirname, "page.tsx"), "utf8");
  expect(kilde).not.toMatch(/MomsCvrPanel|moms-cvr|\/api\/cvr/);
});

test("the calculator used by the embed shows no CVR field, even with the flag on", () => {
  vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "1");
  render(
    <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
      <MomsBeregner />
    </LocaleProvider>,
  );
  expect(screen.getAllByText(/moms/i).length).toBeGreaterThan(0);
  expect(screen.queryByLabelText("CVR-nummer")).toBeNull();
  expect(screen.queryByTestId("moms-cvr")).toBeNull();
});
