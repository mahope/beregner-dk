"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Calculator } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLocale } from "./LocaleProvider";
import { getNavigation, type NavItem } from "@/lib/navigation";
import { getTranslations } from "@/lib/i18n";

function DropdownMenu({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button type="button"
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {item.name}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 py-1 z-50">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNav({
  navigation,
  allCalculatorsLabel,
}: {
  navigation: NavItem[];
  allCalculatorsLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <>
      <button type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-[65px] z-40 bg-white dark:bg-gray-900 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 text-gray-900 dark:text-white font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <Calculator className="w-5 h-5" />
              {allCalculatorsLabel}
            </Link>

            {navigation.map((item) =>
              item.children ? (
                <div key={item.name}>
                  <button type="button"
                    onClick={() =>
                      setOpenCategory(
                        openCategory === item.name ? null : item.name
                      )
                    }
                    className="flex items-center justify-between w-full px-4 py-3 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {item.name}
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openCategory === item.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openCategory === item.name && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className="block px-4 py-3 text-gray-900 dark:text-white font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export default function Header() {
  const { locale, domainConfig } = useLocale();
  const navigation = getNavigation(locale);
  const t = getTranslations(locale);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 sticky top-0 z-50 transition-colors border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Calculator className="w-6 h-6" />
            <span className="hidden sm:inline">{domainConfig.siteName}</span>
            <span className="sm:hidden">{domainConfig.siteName.split(".")[0]}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <DropdownMenu key={item.name} item={item} />
            ))}
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <MobileNav
              navigation={navigation}
              allCalculatorsLabel={t.nav.allCalculators}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
