"use client";

import { trackAffiliateClick } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Car, Landmark, ScrollText, ShieldCheck } from "lucide-react";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  cta: string;
  logo?: string;
  highlight?: boolean;
}

interface AffiliateBoxProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  links: AffiliateLink[];
  className?: string;
}

/**
 * AffiliateBox - Viser affiliate links med tydelig disclosure
 * 
 * Kræver "Annonce" label per dansk markedsføringslov.
 */
export function AffiliateBox({ title, subtitle, icon: Icon, links, className = "" }: AffiliateBoxProps) {
  const { locale } = useLocale();
  // Every affiliate partner is Danish (.dk links, "Annonce" disclosure per
  // dansk markedsføringslov), so only show these on the Danish site.
  if (locale !== "da") return null;

  return (
    <div className={`border-2 border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden ${className}`}>
      {/* Header med disclosure */}
      <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-blue-800 dark:text-blue-200">
              {Icon && (
                <Icon className="mr-1.5 inline h-4 w-4 align-text-bottom" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              )}
              {title}
            </h3>
            {subtitle && <p className="text-sm text-blue-600 dark:text-blue-400">{subtitle}</p>}
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
            Annonce
          </span>
        </div>
      </div>

      {/* Affiliate links */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener sponsored"
            onClick={() => trackAffiliateClick(title, link.url)}
            className={`block p-4 transition-colors ${
              link.highlight 
                ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{link.name}</span>
                  {link.highlight && (
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Populær
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{link.description}</p>
              </div>
              <span className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                {link.cta} →
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        Vi kan modtage kommission fra vores partnere. Dette påvirker ikke vores anbefalinger.
      </div>
    </div>
  );
}

// Pre-konfigurerede affiliate data
//
// Kun programmer Mahope er godkendt til hos Partner-ads (partnerid 42553).
// uid=minberegner gør klik og salg synlige pr. site i Partner-ads' statistik.
// Tilføj ALDRIG links med en hjemmelavet ?ref= — de giver ingen kommission.

const PARTNER_ADS_ID = "42553";

/** Partner-ads tracking-link, evt. som deeplink til en underside hos annoncøren. */
export function partnerAdsLink(bannerId: string, deeplink?: string): string {
  const base = `https://www.partner-ads.com/dk/klikbanner.php?partnerid=${PARTNER_ADS_ID}&bannerid=${bannerId}&uid=minberegner`;
  return deeplink ? `${base}&htmlurl=${encodeURIComponent(deeplink)}` : base;
}

const COVER_BILFORSIKRING = "110013"; // Cover Forsikring (11253), 275 kr./lead
const FINDFORSIKRING = "60068"; // Findforsikring.dk (4935), 60 kr./lead
const DINERO = "50128"; // Dinero Regnskab (5513), 50 kr./lead
const JURA_DOCS = "99220"; // Jura-Docs (10074), 35 %
const DOKUMENT_24 = "71629"; // Dokument 24 (7464), 25 %

export const boligforsikringAffiliates: AffiliateLink[] = [
  {
    name: "Findforsikring.dk",
    description: "Få 3 gratis tilbud på hus- og indboforsikring, når du køber bolig",
    url: partnerAdsLink(FINDFORSIKRING),
    cta: "Få tilbud",
    highlight: true,
  },
];

export const forsikringAffiliates: AffiliateLink[] = [
  {
    name: "Findforsikring.dk",
    description: "Få 3 gratis tilbud på dine forsikringer og se, hvor meget du kan spare",
    url: partnerAdsLink(FINDFORSIKRING),
    cta: "Få tilbud",
    highlight: true,
  },
];

export const bilforsikringAffiliates: AffiliateLink[] = [
  {
    name: "Cover Bilforsikring",
    description: "Skift bilforsikring online på 2 minutter (i samarbejde med Aros Forsikring)",
    url: partnerAdsLink(COVER_BILFORSIKRING),
    cta: "Se pris",
    highlight: true,
  },
  {
    name: "Findforsikring.dk",
    description: "Få 3 gratis tilbud på din bilforsikring",
    url: partnerAdsLink(FINDFORSIKRING),
    cta: "Få tilbud",
  },
];

export const selvstaendigAffiliates: AffiliateLink[] = [
  {
    name: "Dinero Regnskab",
    description: "Gratis regnskabsprogram til iværksættere og små virksomheder — moms, fakturaer og bilag",
    url: partnerAdsLink(DINERO),
    cta: "Prøv gratis",
    highlight: true,
  },
];

export const testamenteAffiliates: AffiliateLink[] = [
  {
    name: "Jura-Docs",
    description: "Testamente, ægtepagt og fremtidsfuldmagt online — leveret på mail på få minutter",
    url: partnerAdsLink(JURA_DOCS),
    cta: "Se dokumenter",
    highlight: true,
  },
  {
    name: "Dokument 24",
    description: "Lav testamente eller ægtepagt online med gratis juridisk vejledning",
    url: partnerAdsLink(DOKUMENT_24),
    cta: "Se priser",
  },
];

// Convenience komponenter

export function BoliglaanAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Køber du bolig?"
      icon={Landmark}
      subtitle="Husk forsikringen, når du overtager boligen"
      links={boligforsikringAffiliates}
      className={className}
    />
  );
}

export function ForsikringAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Sammenlign forsikringer"
      icon={ShieldCheck}
      subtitle="Spar penge på dine forsikringer"
      links={forsikringAffiliates}
      className={className}
    />
  );
}

export function BilforsikringAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Sammenlign bilforsikringer"
      icon={Car}
      subtitle="Bilforsikringen er ofte en af bilens største faste udgifter"
      links={bilforsikringAffiliates}
      className={className}
    />
  );
}

export function SelvstaendigAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Selvstændig?"
      icon={Briefcase}
      subtitle="Hold styr på moms og fakturaer"
      links={selvstaendigAffiliates}
      className={className}
    />
  );
}

export function TestamenteAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Bestem selv, hvem der arver"
      icon={ScrollText}
      subtitle="Et testamente kan ændre fordelingen og dermed afgiften"
      links={testamenteAffiliates}
      className={className}
    />
  );
}
