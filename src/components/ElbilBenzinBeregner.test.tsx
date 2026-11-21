import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ElbilBenzinBeregner from "./ElbilBenzinBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { elbilSammenligning, elbilForudsætninger } from "@/lib/braendstof";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderElbil(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <ElbilBenzinBeregner />
    </LocaleProvider>,
  );
}

/** Felterne i den rækkefølge, de står i værktøjet. */
function inputValues(container: HTMLElement) {
  return Array.from(container.querySelectorAll("input")).map((input) => input.value);
}

afterEach(cleanup);

describe("ElbilBenzinBeregner", () => {
  test("danske standarder kommer fra ELBIL_FORUDSETNINGER, ikke fra koden", () => {
    const f = elbilForudsætninger("da");
    const { container } = renderElbil("da");
    const [km, aar, elForbrug, elPris, benzinForbrug, benzinPris, merpris] = inputValues(container);
    expect(km).toBe(String(f.kmPrAar));
    expect(aar).toBe(String(f.aar));
    expect(elForbrug).toBe(String(f.elKwhPer100km));
    expect(elPris).toBe(String(f.elKwhPris));
    expect(benzinForbrug).toBe(String(f.benzinKmPerLiter));
    expect(benzinPris).toBe(String(f.benzinLiterPris));
    expect(merpris).toBe("0");
  });

  test("svenske standarder er svenske, ikke danske", () => {
    const f = elbilForudsætninger("se");
    const { container } = renderElbil("se");
    const [, , elForbrug, elPris, , benzinPris] = inputValues(container);
    expect(elForbrug).toBe("18");
    expect(elPris).toBe(String(f.elKwhPris));
    expect(elPris).not.toBe("2.5");
    expect(benzinPris).toBe("19");
  });

  test("årlig besparelse på standarderne er den, siden og FAQ'en lover", () => {
    const da = elbilSammenligning("da");
    const aarlig = Math.round(
      (da.benzinPrisPrKm - da.elPrisPrKm) * da.forudsætninger.kmPrAar,
    );
    const { container } = renderElbil("da");
    const resultat = Array.from(container.querySelectorAll(".text-3xl"))
      .map((element) => element.textContent)
      .join(" ");
    // 5.906 kr. pr. år — ikke et løfte om "under halvdelen".
    expect(resultat.replace(/\u00a0/g, " ")).toContain(aarlig.toLocaleString("da-DK"));
  });
});
