"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export function FAQ({ items, title }: FAQProps) {
  const { locale } = useLocale();
  const faqTitle = title || t(locale as Locale, "ui.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">{faqTitle}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <button type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium pr-4">{item.question}</span>
              <span
                className={`text-2xl text-gray-400 transition-transform ${
                  openIndex === index ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Export for use in data files
export type { FAQItem };
export default FAQ;
