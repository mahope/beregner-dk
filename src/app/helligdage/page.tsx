import { buildHelligdagMetadata, HelligdagRoute } from "@/components/Helligdag";

const STI = "/helligdage";

/**
 * Helligdage med dato og ugedag regnes af dagens årstal, så siden må ikke
 * bygges ind i tal der fryser ved `next build` — samme grund som på
 * `/arbejdsdage` og `/dage-til`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildHelligdagMetadata(STI, new Date());
}

export default async function HelligdagPage() {
  return HelligdagRoute({ prefix: STI });
}
