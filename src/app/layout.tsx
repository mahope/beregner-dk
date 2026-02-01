import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beregner.dk - Gratis online beregnere",
  description: "Danmarks samling af gratis online beregnere. Elberegner, lønberegner, BMI og meget mere.",
  keywords: "beregner, online beregner, gratis beregner, bmi beregner, lønberegner, boliglånsberegner, pensionsberegner, elberegner",
  openGraph: {
    title: "Beregner.dk - Gratis online beregnere",
    description: "Danmarks samling af gratis online beregnere.",
    url: "https://beregner.dk",
    siteName: "Beregner.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="beregner.dk"
          src="https://analytics.holstjensen.eu/js/script.js"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <a href="/" className="text-2xl font-bold text-blue-600">
              Beregner.dk
            </a>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-3">Økonomi</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="/boliglaan" className="hover:text-blue-600">Boliglånsberegner</a></li>
                  <li><a href="/loen-efter-skat" className="hover:text-blue-600">Løn efter skat</a></li>
                  <li><a href="/feriepenge" className="hover:text-blue-600">Feriepenge</a></li>
                  <li><a href="/pension" className="hover:text-blue-600">Pension</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Familie</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="/boernepenge" className="hover:text-blue-600">Børnepenge</a></li>
                  <li><a href="/su" className="hover:text-blue-600">SU beregner</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Forbrug</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="/elberegner" className="hover:text-blue-600">Elberegner</a></li>
                  <li><a href="/bil" className="hover:text-blue-600">Bilomkostninger</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Sundhed</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="/bmi" className="hover:text-blue-600">BMI beregner</a></li>
                  <li><a href="/kalorier" className="hover:text-blue-600">Kalorieberegner</a></li>
                  <li><a href="https://levetidsberegner.dk" className="hover:text-blue-600">Levetidsberegner ↗</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm border-t pt-6">
              <p>© 2026 Beregner.dk - Gratis online beregnere</p>
              <p className="mt-2">
                Et <a href="https://mahope.dk" className="hover:text-blue-600">Mahope</a> projekt
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
