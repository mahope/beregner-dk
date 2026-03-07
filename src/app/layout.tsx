import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SkipLink } from "@/components/SkipLink";
import { FooterAd } from "@/components/ads/AdBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MinBeregner.dk - Gratis online beregnere",
    template: "%s | MinBeregner.dk",
  },
  description:
    "Danmarks samling af gratis online beregnere. BMI, løn efter skat, elberegner, feriepenge, børnepenge, SU og meget mere. Helt gratis og uden login.",
  keywords: [
    "beregner",
    "online beregner",
    "gratis beregner",
    "bmi beregner",
    "løn efter skat",
    "lønberegner",
    "elberegner",
    "feriepenge beregner",
    "børnepenge 2026",
    "su beregner",
    "dansk beregner",
  ],
  authors: [{ name: "MinBeregner.dk" }],
  creator: "MinBeregner.dk",
  publisher: "MinBeregner.dk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: baseUrl,
    siteName: "MinBeregner.dk",
    title: "MinBeregner.dk - Gratis online beregnere",
    description:
      "Danmarks samling af gratis online beregnere til økonomi, sundhed og hverdag.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MinBeregner.dk - Gratis online beregnere",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MinBeregner.dk - Gratis online beregnere",
    description:
      "Danmarks samling af gratis online beregnere til økonomi, sundhed og hverdag.",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        {/* Plausible Analytics - Self-hosted */}
        <script
          defer
          data-domain="minberegner.dk"
          src="https://analytics.holstjensen.eu/js/script.js"
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1902871361369866"
          crossOrigin="anonymous"
        />
        
        <OrganizationSchema />
        <WebSiteSchema
          name="MinBeregner.dk"
          url={baseUrl}
          description="Danmarks samling af gratis online beregnere"
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col antialiased transition-colors`}>
        <ThemeProvider>
          <SkipLink />
          <Header />

          <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full outline-none">
            {children}
          </main>

          <CookieConsent />
          <ServiceWorkerRegistration />

          <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-auto border-t border-transparent dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 pb-10 border-b border-gray-800 text-sm">
              <span className="flex items-center gap-2">🧮 <strong className="text-white">33+</strong> gratis beregnere</span>
              <span className="flex items-center gap-2">📅 Opdateret med <strong className="text-white">2026-satser</strong></span>
              <span className="flex items-center gap-2">🔒 <strong className="text-white">Ingen login</strong> påkrævet</span>
              <span className="flex items-center gap-2">🇩🇰 Lavet til <strong className="text-white">danskere</strong></span>
            </div>

            {/* All calculators by category */}
            <div className="mb-10 pb-10 border-b border-gray-800">
              <h3 className="text-white font-semibold mb-6">Alle beregnere</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-6 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">💰 Økonomi</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/loen-efter-skat" className="hover:text-white transition-colors">Løn efter skat</Link></li>
                    <li><Link href="/moms" className="hover:text-white transition-colors">Momsberegner</Link></li>
                    <li><Link href="/feriepenge" className="hover:text-white transition-colors">Feriepenge</Link></li>
                    <li><Link href="/dagpenge" className="hover:text-white transition-colors">Dagpenge</Link></li>
                    <li><Link href="/pension" className="hover:text-white transition-colors">Pension</Link></li>
                    <li><Link href="/efterloen" className="hover:text-white transition-colors">Efterløn</Link></li>
                    <li><Link href="/arveafgift" className="hover:text-white transition-colors">Arveafgift</Link></li>
                    <li><Link href="/rentefradrag" className="hover:text-white transition-colors">Rentefradrag</Link></li>
                    <li><Link href="/procent" className="hover:text-white transition-colors">Procent</Link></li>
                    <li><Link href="/valuta" className="hover:text-white transition-colors">Valuta</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">🏠 Bolig</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/boliglaan" className="hover:text-white transition-colors">Boliglån</Link></li>
                    <li><Link href="/boligstoette" className="hover:text-white transition-colors">Boligstøtte</Link></li>
                    <li><Link href="/husleje" className="hover:text-white transition-colors">Husleje Budget</Link></li>
                    <li><Link href="/ejendomsvaerdiskat" className="hover:text-white transition-colors">Ejendomsskat</Link></li>
                    <li><Link href="/kvadratmeter" className="hover:text-white transition-colors">Kvadratmeter</Link></li>
                    <li><Link href="/elberegner" className="hover:text-white transition-colors">Elberegner</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">🏦 Lån & Rente</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/laaneberegner" className="hover:text-white transition-colors">Låneberegner</Link></li>
                    <li><Link href="/renteberegner" className="hover:text-white transition-colors">Renteberegner</Link></li>
                    <li><Link href="/opsparing" className="hover:text-white transition-colors">Opsparing</Link></li>
                    <li><Link href="/billaan" className="hover:text-white transition-colors">Billån</Link></li>
                    <li><Link href="/forbrugslaan" className="hover:text-white transition-colors">Forbrugslån</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">❤️ Sundhed</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/bmi" className="hover:text-white transition-colors">BMI Beregner</Link></li>
                    <li><Link href="/kalorier" className="hover:text-white transition-colors">Kalorieberegner</Link></li>
                    <li><Link href="/alder" className="hover:text-white transition-colors">Aldersberegner</Link></li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 mt-4">👨‍👩‍👧 Familie</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/boernepenge" className="hover:text-white transition-colors">Børnepenge</Link></li>
                    <li><Link href="/barselsdagpenge" className="hover:text-white transition-colors">Barselsdagpenge</Link></li>
                    <li><Link href="/su" className="hover:text-white transition-colors">SU Beregner</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">🔧 Hverdag</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/braendstof" className="hover:text-white transition-colors">Brændstof</Link></li>
                    <li><Link href="/bil" className="hover:text-white transition-colors">Bil Værdtab</Link></li>
                    <li><Link href="/timepris" className="hover:text-white transition-colors">Timepris</Link></li>
                    <li><Link href="/dato" className="hover:text-white transition-colors">Datoberegner</Link></li>
                    <li><Link href="/tidsberegner" className="hover:text-white transition-colors">Tidsberegner</Link></li>
                    <li><Link href="/tidszone" className="hover:text-white transition-colors">Tidszoner</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Blog + info + cross-links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-gray-800">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">MinBeregner.dk</h3>
                <p className="text-sm mb-4">
                  Gratis online beregnere til danskere. Alle beregninger sker
                  lokalt i din browser — vi gemmer ingen data.
                </p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/om" className="hover:text-white transition-colors">Om MinBeregner.dk</Link></li>
                  <li><Link href="/privatlivspolitik" className="hover:text-white transition-colors">Privatlivspolitik</Link></li>
                  <li><Link href="/cookiepolitik" className="hover:text-white transition-colors">Cookiepolitik</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Seneste artikler</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog/skat-2026-alt-du-skal-vide" className="hover:text-white transition-colors">Skat 2026: Alt du skal vide</Link></li>
                  <li><Link href="/blog/fradrag-2026-komplet-guide" className="hover:text-white transition-colors">Fradrag 2026: Komplet guide</Link></li>
                  <li><Link href="/blog/boliglaan-2026-renter-og-afdrag" className="hover:text-white transition-colors">Boliglån 2026: Renter og afdrag</Link></li>
                  <li><Link href="/blog" className="text-blue-400 hover:text-blue-300 transition-colors">Se alle artikler →</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Andre gratis værktøjer</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://gratisfaktura.dk" className="hover:text-white transition-colors">📄 Faktura Generator</a></li>
                  <li><a href="https://kodeord.dk" className="hover:text-white transition-colors">🔐 Kodeord Generator</a></li>
                  <li><a href="https://countdowntimer.dk" className="hover:text-white transition-colors">⏰ Countdown Timer</a></li>
                  <li><a href="https://loenberegner.dk" className="hover:text-white transition-colors">💰 Lønberegner</a></li>
                  <li><a href="https://ai-tools.dk" className="hover:text-white transition-colors">🤖 AI Værktøjer</a></li>
                  <li><a href="https://valuta.holstjensen.eu" className="hover:text-white transition-colors">💱 Valuta Omregner</a></li>
                </ul>
              </div>
            </div>

            <div className="text-center text-sm">
              <p>© {new Date().getFullYear()} MinBeregner.dk — Gratis online beregnere</p>
            </div>

            {/* Footer Ad - Maximum 3 ads per page policy */}
            <FooterAd />
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
