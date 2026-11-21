import KlokkenIPage, { buildKlokkenMetadata } from "@/components/KlokkenIPage";
import { getKlokkenSlugs } from "@/lib/klokken-i";

interface PageProps {
  params: Promise<{ land: string }>;
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getKlokkenSlugs("se").map((land) => ({ land }));
}

export async function generateMetadata({ params }: PageProps) {
  const { land } = await params;
  return buildKlokkenMetadata("se", decodeURIComponent(land), new Date());
}

export default async function KlockanISePage({ params }: PageProps) {
  const { land } = await params;
  return KlokkenIPage({ sprog: "se", slug: decodeURIComponent(land) });
}
