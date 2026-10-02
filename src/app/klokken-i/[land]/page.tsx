import KlokkenIPage, {
  buildKlokkenMetadata,
} from "@/components/KlokkenIPage";
import { getKlokkenSlugs } from "@/lib/klokken-i";

interface PageProps {
  params: Promise<{ land: string }>;
}

/**
 * Svaret er klokken *lige nu*, så siden må ikke bygges ind i et tal der
 * bliver frosset ved `next build`: da ville alle 12 lande stå med det samme
 * klokkeslæt på livstid. Derfor beregnes den pr. forespørgsel, og det er
 * samme grund de står i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getKlokkenSlugs("da").map((land) => ({ land }));
}

export async function generateMetadata({ params }: PageProps) {
  const { land } = await params;
  return buildKlokkenMetadata("da", decodeURIComponent(land), new Date());
}

export default async function KlokkenIDaPage({ params }: PageProps) {
  const { land } = await params;
  return KlokkenIPage({ sprog: "da", slug: decodeURIComponent(land) });
}
