"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export function FAQ({ items, title = "Ofte stillede spørgsmål" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
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
              <div className="px-6 pb-4 text-gray-600">
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
