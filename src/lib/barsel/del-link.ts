/**
 * Share link: the plan is JSON-serialised, deflate-compressed with the
 * browser's native CompressionStream and stored base64url-encoded in the URL
 * hash. The hash is never sent to the server.
 */

const PREFIX = "plan=";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const response = new Response(source.pipeThrough(stream as unknown as TransformStream<Uint8Array, Uint8Array>));
  return new Uint8Array(await response.arrayBuffer());
}

export function kanKomprimere(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

export async function kodPlan(data: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  if (kanKomprimere()) {
    return `z${toBase64Url(await pipe(json, new CompressionStream("deflate-raw")))}`;
  }
  return `j${toBase64Url(json)}`;
}

export async function afkodPlan(encoded: string): Promise<unknown | null> {
  try {
    const kind = encoded[0];
    const bytes = fromBase64Url(encoded.slice(1));
    let json: Uint8Array;
    if (kind === "z") {
      if (!kanKomprimere()) return null;
      json = await pipe(bytes, new DecompressionStream("deflate-raw"));
    } else if (kind === "j") {
      json = bytes;
    } else {
      return null;
    }
    return JSON.parse(new TextDecoder().decode(json));
  } catch {
    return null;
  }
}

export function hashMedPlan(encoded: string): string {
  return `#${PREFIX}${encoded}`;
}

/** Extract the encoded plan from a location hash, if present. */
export function planFraHash(hash: string): string | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean.startsWith(PREFIX)) return null;
  const value = clean.slice(PREFIX.length);
  return value.length > 1 ? value : null;
}
