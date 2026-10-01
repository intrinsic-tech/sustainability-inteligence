import { create } from "zustand";
import { persist } from "zustand/middleware";

export const languages = ["en", "it"] as const;

export type Language = (typeof languages)[number];

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "it",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "sustainability-language",
      // Rehydrated in LanguageSync after mount so server and client markup match.
      skipHydration: true,
    },
  ),
);
