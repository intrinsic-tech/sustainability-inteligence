import enCommon from "@/locales/en/common.json";
import enDashboard from "@/locales/en/dashboard.json";
import enLogin from "@/locales/en/login.json";
import itCommon from "@/locales/it/common.json";
import itDashboard from "@/locales/it/dashboard.json";
import itLogin from "@/locales/it/login.json";
import { useLanguageStore, type Language } from "@/store/useLanguageStore";

const en = {
  common: enCommon,
  dashboard: enDashboard,
  login: enLogin,
};

export type Messages = typeof en;
export type Namespace = keyof Messages;

// Typed against the English files, so a missing Italian key fails the build.
const it: Messages = {
  common: itCommon,
  dashboard: itDashboard,
  login: itLogin,
};

const messages: Record<Language, Messages> = { en, it };

export function useTranslations<N extends Namespace>(namespace: N) {
  const language = useLanguageStore((state) => state.language);
  return messages[language][namespace];
}

export function format(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
