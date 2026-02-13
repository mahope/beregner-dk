"use client";

import Link from "next/link";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

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
    <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            MinBeregner.dk
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navigation.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileMenu items={navigation} />
          </div>
        </div>
      </div>
    </header>
  );
}
