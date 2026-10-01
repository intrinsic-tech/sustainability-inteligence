"use client";

import { useTranslations } from "@/i18n";
import { languages, useLanguageStore } from "@/store/useLanguageStore";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div
      className={`lang-toggle ${className}`}
      role="group"
      aria-label={t.language.label}
    >
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          className={language === code ? "lang-active" : ""}
          aria-pressed={language === code}
          aria-label={t.language[code]}
          title={t.language[code]}
          onClick={() => setLanguage(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
