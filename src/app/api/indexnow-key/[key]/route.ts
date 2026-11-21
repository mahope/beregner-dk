import { getIndexNowKey, isValidIndexNowKey } from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const configuredKey = getIndexNowKey();
  const headers = { "Cache-Control": "no-store" };

  if (
    !isValidIndexNowKey(configuredKey) ||
    key !== configuredKey
  ) {
    return new Response(null, { status: 404, headers });
  }

  return new Response(configuredKey, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
