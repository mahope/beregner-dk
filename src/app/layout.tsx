import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";

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

const navigation = [
  { name: "Forside", href: "/" },
  { name: "BMI", href: "/bmi" },
  { name: "Løn", href: "/loen-efter-skat" },
  { name: "Rente", href: "/renteberegner" },
  { name: "El", href: "/elberegner" },
  { name: "Feriepenge", href: "/feriepenge" },
  { name: "SU", href: "/su" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        <OrganizationSchema />
        <WebSiteSchema
          name="MinBeregner.dk"
          url={baseUrl}
          description="Danmarks samling af gratis online beregnere"
        />
      </head>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                MinBeregner.dk
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navigation.slice(1).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              {/* Mobile menu button - could be expanded */}
              <button
                className="md:hidden p-2 text-gray-600"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>

        <footer className="bg-gray-900 text-gray-300 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-12">
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
                    <Link href="/elberegner" className="hover:text-white transition-colors">
                      Elberegner
                    </Link>
                  </li>
                  <li>
                    <Link href="/feriepenge" className="hover:text-white transition-colors">
                      Feriepenge
                    </Link>
                  </li>
                  <li>
                    <Link href="/su" className="hover:text-white transition-colors">
                      SU Beregner
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
