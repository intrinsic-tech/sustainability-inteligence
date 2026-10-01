"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/i18n";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const common = useTranslations("common");
  const t = useTranslations("login");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.setItem("sustainability-demo-session", "active");
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label={common.brand.full}>
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark">
            <Leaf size={21} strokeWidth={2.1} />
          </span>
          <span>
            {common.brand.first}
            <span className="brand-lockup-second">{common.brand.second}</span>
          </span>
        </div>
        <div className="login-aside-copy">
          <span className="eyebrow eyebrow-light">{t.aside.eyebrow}</span>
          <h1>
            {t.aside.titleLine1}
            <br />
            {t.aside.titleLine2}
          </h1>
          <p>{t.aside.description}</p>
        </div>
        <div className="aside-footer">
          <span className="status-dot" /> {t.aside.footer}
        </div>
      </section>

      <section className="login-main">
        <div className="login-topbar">
          <LanguageSwitcher />
        </div>
        <div className="login-card-wrap">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark">
              <Leaf size={21} strokeWidth={2.1} />
            </span>
            <span>
              {common.brand.first}
              <span className="brand-lockup-second">{common.brand.second}</span>
            </span>
          </div>
          <div className="login-heading">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              {t.email}
            </label>
            <div className="input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                required
              />
            </div>
            <div className="password-label-row">
              <label className="field-label" htmlFor="password">
                {t.password}
              </label>
              <button className="text-button" type="button">
                {t.forgotPassword}
              </button>
            </div>
            <div className="input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                className="icon-button password-toggle"
                type="button"
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="button-primary login-submit" type="submit">
              {t.submit} <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-note">
            <span className="note-rule" />
            {t.demoAccess}
            <span className="note-rule" />
          </div>
          <p className="login-legal">{t.legal}</p>
        </div>
        <div className="login-copyright">{t.copyright}</div>
      </section>
    </main>
  );
}
