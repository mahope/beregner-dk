// Server-only HTTP client for cvrradar's internal endpoint.
//
// Why not fetch: Node's fetch (undici) always adds `Sec-Fetch-Mode: cors`, and cvrradar
// answers 403 to anything that looks like a browser (Origin, Sec-Fetch-* or Cookie), even
// with the right key. node:http(s) sends only the headers we set.
import http from "node:http";
import https from "node:https";

export interface CvrradarHttpSvar {
  status: number;
  /** Parsed JSON body, or null if the body was not JSON. */
  json: unknown;
}

const MAKS_SVAR_BYTES = 64 * 1024;

/** POSTs JSON with a bearer key. Rejects on network errors and on timeout. */
export function postTilCvrradar(
  url: string,
  noegle: string,
  body: unknown,
  timeoutMs: number,
): Promise<CvrradarHttpSvar> {
  const adresse = new URL(url);
  const klient = adresse.protocol === "http:" ? http : https;
  const data = Buffer.from(JSON.stringify(body), "utf8");
  return new Promise((resolve, reject) => {
    const req = klient.request(
      adresse,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${noegle}`,
          "content-type": "application/json",
          accept: "application/json",
          "content-length": String(data.length),
          "user-agent": "minberegner.dk",
        },
        timeout: timeoutMs,
      },
      (res) => {
        const dele: Buffer[] = [];
        let laengde = 0;
        res.on("data", (d: Buffer) => {
          laengde += d.length;
          if (laengde > MAKS_SVAR_BYTES) {
            req.destroy(new Error("svaret er for stort"));
            return;
          }
          dele.push(d);
        });
        res.on("end", () => {
          let json: unknown = null;
          try {
            json = JSON.parse(Buffer.concat(dele).toString("utf8"));
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode ?? 0, json });
        });
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end(data);
  });
}
