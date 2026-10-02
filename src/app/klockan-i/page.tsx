import {
  buildKlokkenHubMetadata,
  KlokkenIHubRoute,
} from "@/components/KlokkenIHub";

const HUB = "/klockan-i";

/** Klokken er «lige nu», så tallene må ikke frosset ved `next build`. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildKlokkenHubMetadata(HUB, new Date());
}

export default async function KlockanIHubPage() {
  return KlokkenIHubRoute({ prefix: HUB });
}
