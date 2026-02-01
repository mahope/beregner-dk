import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beregner.dk - Gratis online beregnere",
  description: "Danmarks samling af gratis online beregnere. Elberegner, lønberegner, BMI og meget mere.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
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
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
            <p>© 2026 Beregner.dk - Gratis online beregnere</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
