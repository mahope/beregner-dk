"use client";

import Link from "next/link";
import MobileMenu from "./MobileMenu";

const navigation = [
  { name: "Forside", href: "/" },
  { name: "BMI", href: "/bmi" },
  { name: "Løn", href: "/loen-efter-skat" },
  { name: "Rente", href: "/renteberegner" },
  { name: "Procent", href: "/procent" },
  { name: "El", href: "/elberegner" },
  { name: "SU", href: "/su" },
];

export default function Header() {
  return (
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
          <MobileMenu items={navigation} />
        </div>
      </div>
    </header>
  );
}
