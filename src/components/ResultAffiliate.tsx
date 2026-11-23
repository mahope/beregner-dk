"use client";

import { AffiliateBox } from "./AffiliateBox";
import { adtractionLink, TRACKING_URLS } from "@/lib/adtraction";

export function LifesumAffiliate() {
  const url = TRACKING_URLS["1951492778"];
  if (!url) return null;

  return (
    <AffiliateBox
      title="Følg dit kalorieindtag"
      placement="lifesum"
      links={[{
        name: "Lifesum",
        description: "Registrér dine måltider, og se dit daglige indtag af kalorier, protein, fedt og kulhydrater.",
        url,
        cta: "Se appen",
      }]}
    />
  );
}

export function SolvariAffiliate() {
  const programId = "1888641530";
  if (!TRACKING_URLS[programId]) return null;

  return (
    <AffiliateBox
      title="Sammenlign tilbud på solceller"
      placement="solvari"
      links={[{
        name: "Solvari",
        description: "Få tilbud fra installatører, og sammenlign priserne med anlægsprisen i dit overslag.",
        url: adtractionLink(programId, "https://www.solvari.dk/solceller"),
        cta: "Se tilbud",
      }]}
    />
  );
}
