import { buildHelligdagMetadata, HelligdagRoute } from "@/components/Helligdag";

const STI = "/helgdagar";

/**
 * Svensk helg: samma komponent som `/helligdage`, men stien vælger sproget
 * (se `/helgdagar`). Datoerne følger dagens årstal, så siden ikke må fryses
 * ind i `next build` — derfor `daily` i sitemap.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildHelligdagMetadata(STI, new Date());
}

export default async function HelgdagarPage() {
  return HelligdagRoute({ prefix: STI });
}
