"use client";

import { trackAffiliateClick } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import type { LucideIcon } from "lucide-react";
import { Car, Landmark, ShieldCheck, TrendingUp } from "lucide-react";

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

export const boliglaanAffiliates: AffiliateLink[] = [
  {
    name: "Mybanker",
    description: "Sammenlign boliglån fra alle danske banker - find den laveste rente",
    url: "https://www.mybanker.dk/boliglaan/?ref=minberegner",
    cta: "Sammenlign",
    highlight: true,
  },
  {
    name: "Nordea",
    description: "Få et uforpligtende lånetilbud på 2 minutter",
    url: "https://www.nordea.dk/privat/lan/boliglan/?ref=minberegner",
    cta: "Få tilbud",
  },
  {
    name: "Totalkredit",
    description: "Danmarks største realkreditinstitut - lav bidragssats",
    url: "https://www.totalkredit.dk/?ref=minberegner",
    cta: "Se renter",
  },
  {
    name: "Realkredit Danmark",
    description: "Fleksible låneløsninger med god rådgivning",
    url: "https://www.rd.dk/?ref=minberegner",
    cta: "Beregn lån",
  },
];

export const opsparingAffiliates: AffiliateLink[] = [
  {
    name: "Nordnet",
    description: "Investér i aktier og fonde fra 29 kr/måned",
    url: "https://www.nordnet.dk/?ref=minberegner",
    cta: "Opret konto",
    highlight: true,
  },
  {
    name: "Saxo Bank",
    description: "Danmarks billigste kurtage på aktiehandel",
    url: "https://www.saxobank.dk/?ref=minberegner",
    cta: "Kom i gang",
  },
  {
    name: "Lunar",
    description: "Mobilbank med højrentekonto - nem oprettelse",
    url: "https://www.lunar.app/?ref=minberegner",
    cta: "Åbn konto",
  },
];

export const forsikringAffiliates: AffiliateLink[] = [
  {
    name: "Samlino",
    description: "Sammenlign forsikringer fra 20+ selskaber på 2 minutter",
    url: "https://www.samlino.dk/?ref=minberegner",
    cta: "Sammenlign",
    highlight: true,
  },
  {
    name: "Forsikringsguiden",
    description: "Find den billigste forsikring til dine behov",
    url: "https://www.forsikringsguiden.dk/?ref=minberegner",
    cta: "Tjek priser",
  },
  {
    name: "Topdanmark",
    description: "En af Danmarks største forsikringsselskaber",
    url: "https://www.topdanmark.dk/?ref=minberegner",
    cta: "Få tilbud",
  },
];

export const bilforsikringAffiliates: AffiliateLink[] = [
  {
    name: "Samlino Bilforsikring",
    description: "Sammenlign bilforsikringer fra 15+ selskaber - spar op til 3.000 kr/år",
    url: "https://www.samlino.dk/bilforsikring/?ref=minberegner",
    cta: "Sammenlign",
    highlight: true,
  },
  {
    name: "Alm. Brand",
    description: "Bilforsikring med vejhjælp og fri autoreparatør",
    url: "https://www.almbrand.dk/forsikringer/bilforsikring/?ref=minberegner",
    cta: "Beregn pris",
  },
  {
    name: "Topdanmark Bil",
    description: "Få tilbud på 2 min - inkl. bonus fra andre selskaber",
    url: "https://www.topdanmark.dk/forsikring/bilforsikring/?ref=minberegner",
    cta: "Få tilbud",
  },
  {
    name: "Tryg Bilforsikring",
    description: "Danmarks mest valgte bilforsikring - hurtig skadebehandling",
    url: "https://www.tryg.dk/privat/forsikringer/bilforsikring/?ref=minberegner",
    cta: "Se priser",
  },
];

// Convenience komponenter

export function BoliglaanAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Sammenlign boliglån"
      icon={Landmark}
      subtitle="Find det bedste lån til din bolig"
      links={boliglaanAffiliates}
      className={className}
    />
  );
}

export function OpsparingAffiliate({ className = "" }: { className?: string }) {
  return (
    <AffiliateBox
      title="Start din opsparing"
      icon={TrendingUp}
      subtitle="Investeringsplatforme til danskere"
      links={opsparingAffiliates}
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
      subtitle="Spar op til 50% på din bilforsikring"
      links={bilforsikringAffiliates}
      className={className}
    />
  );
}
