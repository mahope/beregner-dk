// @vitest-environment node
import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { postTilCvrradar } from "./cvrradar-klient";

let server: http.Server | null = null;

function startServer(svar: (req: http.IncomingMessage, body: string) => { status: number; body: string }) {
  return new Promise<{ url: string; set: Array<{ headers: http.IncomingHttpHeaders; body: string }> }>((resolve) => {
    const set: Array<{ headers: http.IncomingHttpHeaders; body: string }> = [];
    server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (d) => (body += d));
      req.on("end", () => {
        set.push({ headers: req.headers, body });
        const s = svar(req, body);
        res.writeHead(s.status, { "content-type": "application/json" });
        res.end(s.body);
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server!.address() as AddressInfo;
      resolve({ url: `http://127.0.0.1:${port}/v1/intern/beregner`, set });
    });
  });
}

afterEach(async () => {
  await new Promise<void>((r) => (server ? server.close(() => r()) : r()));
  server = null;
});

describe("postTilCvrradar", () => {
  it("sends nothing cvrradar would take for a browser (Origin, Sec-Fetch-*, Cookie)", async () => {
    const { url, set } = await startServer(() => ({ status: 200, body: '{"selskab":false}' }));
    const svar = await postTilCvrradar(url, "hemmelig-noegle", { cvr: "39413892" }, 2000);
    expect(svar).toEqual({ status: 200, json: { selskab: false } });
    const h = set[0].headers;
    expect(Object.keys(h).filter((k) => k === "origin" || k === "cookie" || k.startsWith("sec-fetch-"))).toEqual([]);
    expect(h.authorization).toBe("Bearer hemmelig-noegle");
    expect(h["content-type"]).toBe("application/json");
    expect(JSON.parse(set[0].body)).toEqual({ cvr: "39413892" });
  });

  it("returns the status and null json for a non-JSON body", async () => {
    const { url } = await startServer(() => ({ status: 502, body: "Bad gateway" }));
    expect(await postTilCvrradar(url, "k", {}, 2000)).toEqual({ status: 502, json: null });
  });

  it("rejects on timeout", async () => {
    server = http.createServer(() => {
      /* never answers */
    });
    await new Promise<void>((r) => server!.listen(0, "127.0.0.1", () => r()));
    const { port } = server.address() as AddressInfo;
    await expect(postTilCvrradar(`http://127.0.0.1:${port}/`, "k", {}, 100)).rejects.toThrow();
    server.closeAllConnections();
  });
});
