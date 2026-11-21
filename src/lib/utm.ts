// Inverse transverse Mercator (Krüger series) for ETRS89 / UTM, e.g. EPSG:25832 (zone 32N),
// which Adressevælger uses for coordinates. ETRS89 and WGS84 differ by well under a metre in
// Denmark, far below what matters for a driving distance.

const A_AXIS = 6378137; // GRS80 semi-major axis
const FLATTENING = 1 / 298.257222101; // GRS80
const K0 = 0.9996;
const FALSE_EASTING = 500000;

const n = FLATTENING / (2 - FLATTENING);
const n2 = n * n;
const n3 = n2 * n;
const RECTIFYING_RADIUS = (A_AXIS / (1 + n)) * (1 + n2 / 4 + (n2 * n2) / 64);
const BETA = [n / 2 - (2 * n2) / 3 + (37 * n3) / 96, n2 / 48 + n3 / 15, (17 * n3) / 480];
const DELTA = [2 * n - (2 * n2) / 3 - 2 * n3, (7 * n2) / 3 - (8 * n3) / 5, (56 * n3) / 15];

export interface LatLon {
  lat: number;
  lon: number;
}

/** Converts northern-hemisphere UTM easting/northing (metres) to latitude/longitude in degrees. */
export function utmToWgs84(easting: number, northing: number, zone = 32): LatLon {
  const xi = northing / (K0 * RECTIFYING_RADIUS);
  const eta = (easting - FALSE_EASTING) / (K0 * RECTIFYING_RADIUS);

  let xiP = xi;
  let etaP = eta;
  for (let j = 1; j <= 3; j++) {
    const b = BETA[j - 1];
    xiP -= b * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    etaP -= b * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }

  const chi = Math.asin(Math.sin(xiP) / Math.cosh(etaP));
  let phi = chi;
  for (let j = 1; j <= 3; j++) phi += DELTA[j - 1] * Math.sin(2 * j * chi);

  const lambda0 = ((zone * 6 - 183) * Math.PI) / 180;
  const lambda = lambda0 + Math.atan2(Math.sinh(etaP), Math.cos(xiP));

  return { lat: (phi * 180) / Math.PI, lon: (lambda * 180) / Math.PI };
}
