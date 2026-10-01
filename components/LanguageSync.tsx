"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

export function LanguageSync() {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    useLanguageStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
