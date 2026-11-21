"use client";

import { useState, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
}

export default function NewsletterSignup({
  variant = "card",
  className = "",
}: NewsletterSignupProps) {
  const { locale } = useLocale();
  const l = locale as "da" | "no" | "se";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const res = await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: email, tags: ["minberegner"] }),
      });

      if (res.ok || res.status === 201) {
        setStatus("success");
        setEmail("");
      } else {
        window.open(`https://buttondown.com/minberegner?email=${encodeURIComponent(email)}`, "_blank");
        setStatus("success");
        setEmail("");
      }
    } catch {
      window.open(`https://buttondown.com/minberegner?email=${encodeURIComponent(email)}`, "_blank");
      setStatus("success");
      setEmail("");
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-2xl p-6 bg-green-50 dark:bg-green-900/20 text-center ${className}`}>
        <p className="text-green-700 dark:text-green-300 font-medium">
          {t(l, "ui.newsletterConfirmation")}
        </p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          {t(l, "ui.newsletterConfirmationSub")}
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} ref={formRef} className={`flex gap-2 ${className}`}>
        <label htmlFor="newsletter-email-inline" className="sr-only">Email</label>
        <input
          id="newsletter-email-inline"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(l, "ui.newsletterPlaceholder")}
          required
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? t(l, "ui.newsletterSending") : t(l, "ui.newsletterHeading")}
        </button>
      </form>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 p-6 ${className}`}>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {t(l, "ui.newsletterHeading")}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {t(l, "ui.newsletterBody")}
      </p>
      <form onSubmit={handleSubmit} ref={formRef} className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(l, "ui.newsletterPlaceholder")}
          required
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? t(l, "ui.newsletterSending") : t(l, "ui.newsletterHeading")}
        </button>
      </form>
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          {t(l, "ui.newsletterError")}
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        {t(l, "ui.newsletterPrivacy")}
      </p>
    </div>
  );
}
