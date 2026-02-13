import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";

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
        
        {/* Google AdSense - Tilføj Publisher ID når godkendt */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
        
        <OrganizationSchema />
        <WebSiteSchema
          name="MinBeregner.dk"
          url={baseUrl}
          description="Danmarks samling af gratis online beregnere"
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-gray-50 flex flex-col antialiased`}>
        <Header />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>

        <CookieConsent />

        <footer className="bg-gray-900 text-gray-300 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Cross-linking sektion */}
            <div className="mb-8 pb-8 border-b border-gray-800">
              <h3 className="text-white font-semibold mb-4">🛠️ Andre gratis værktøjer</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                <a href="https://gratisfaktura.dk" className="hover:text-white">📄 Faktura Generator</a>
                <a href="https://kodeord.dk" className="hover:text-white">🔐 Kodeord Generator</a>
                <a href="https://countdowntimer.dk" className="hover:text-white">⏰ Countdown Timer</a>
                <a href="https://loenberegner.dk" className="hover:text-white">💰 Lønberegner</a>
                <a href="https://ai-tools.dk" className="hover:text-white">🤖 AI Værktøjer</a>
                <a href="https://whitenoise.dk" className="hover:text-white">🔊 White Noise</a>
                <a href="https://rejsermedborn.dk" className="hover:text-white">✈️ Rejser m. Børn</a>
                <a href="https://notiondk.dk" className="hover:text-white">📋 Notion Templates</a>
                <a href="https://valuta.holstjensen.eu" className="hover:text-white">💱 Valuta Omregner</a>
                <a href="https://enheder.holstjensen.eu" className="hover:text-white">📏 Enheder Omregner</a>
                <a href="https://citater.holstjensen.eu" className="hover:text-white">💬 Citater</a>
                <a href="https://lorem.holstjensen.eu" className="hover:text-white">📜 Lorem Ipsum</a>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">
                  MinBeregner.dk
                </h3>
                <p className="text-sm">
                  Gratis online beregnere til danskere. Alle beregninger sker
                  lokalt i din browser — vi gemmer ingen data.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Beregnere</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/bmi" className="hover:text-white transition-colors">
                      BMI Beregner
                    </Link>
                  </li>
                  <li>
                    <Link href="/loen-efter-skat" className="hover:text-white transition-colors">
                      Løn efter skat
                    </Link>
                  </li>
                  <li>
                    <Link href="/renteberegner" className="hover:text-white transition-colors">
                      Renteberegner
                    </Link>
                  </li>
                  <li>
                    <Link href="/opsparing" className="hover:text-white transition-colors">
                      Opsparingsberegner
                    </Link>
                  </li>
                  <li>
                    <Link href="/procent" className="hover:text-white transition-colors">
                      Procentberegner
                    </Link>
                  </li>
                  <li>
                    <Link href="/elberegner" className="hover:text-white transition-colors">
                      Elberegner
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Information</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/om" className="hover:text-white transition-colors">
                      Om MinBeregner.dk
                    </Link>
                  </li>
                  <li>
                    <Link href="/privatlivspolitik" className="hover:text-white transition-colors">
                      Privatlivspolitik
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookiepolitik" className="hover:text-white transition-colors">
                      Cookiepolitik
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
              <p>© {new Date().getFullYear()} MinBeregner.dk — Gratis online beregnere</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
