import { describe, expect, test } from "vitest";
import { utmToWgs84 } from "./utm";

// Reference values from PROJ (pyproj EPSG:25832 -> EPSG:4326).
const cases: [string, number, number, number, number][] = [
  ["Rådhuspladsen 1, 1550 København V", 724434.93, 6175755.61, 55.6756275, 12.5695777],
  ["Rådhuspladsen 2, 8000 Aarhus C", 574743.25, 6223719, 56.1526305, 10.2032063],
  ["Sønderjylland (vest for 9° E)", 441000, 6049000, 54.5850421, 8.0870563],
  ["Bornholm (langt øst for zonen)", 870000, 6130000, 55.1777275, 14.8132804],
];

describe("utmToWgs84", () => {
  test.each(cases)("%s", (_navn, x, y, lat, lon) => {
    const r = utmToWgs84(x, y);
    // 1e-6 degrees is roughly 0.1 m
    expect(Math.abs(r.lat - lat)).toBeLessThan(1e-6);
    expect(Math.abs(r.lon - lon)).toBeLessThan(1e-6);
  });

  test("central meridian maps to 9° E in zone 32", () => {
    expect(utmToWgs84(500000, 6200000).lon).toBeCloseTo(9, 9);
  });
});
