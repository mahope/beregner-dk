import {
  buildKlokkenHubMetadata,
  KlokkenIHubRoute,
} from "@/components/KlokkenIHub";

const HUB = "/klokken-i";

/**
 * Svaret er klokken *lige nu*, så siden må ikke bygges ind i et tal der bliver
 * frosset ved `next build`: da ville alle fjorten lande stå med det samme
 * klokkeslæt på livstid. Samme grund som på `/klokken-i/[land]`, og derfor står
 * den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildKlokkenHubMetadata(HUB, new Date());
}

export default async function KlokkenIHubPage() {
  return KlokkenIHubRoute({ prefix: HUB });
}
