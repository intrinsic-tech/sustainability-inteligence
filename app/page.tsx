"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { signIn, signUp, type AuthErrorCode } from "@/app/actions/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/i18n";

type Mode = "signIn" | "signUp";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [notice, setNotice] = useState(false);
  const [pending, startTransition] = useTransition();
  const common = useTranslations("common");
  const t = useTranslations("login");
  const isSignUp = mode === "signUp";
  const copy = isSignUp ? t.signUp : t;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(false);
    setShowPassword(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setNotice(false);

    startTransition(async () => {
      const result = await (isSignUp ? signUp(formData) : signIn(formData));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if ("pending" in result) {
        // New accounts wait for admin approval, so send them back to sign in.
        setMode("signIn");
        setNotice(true);
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label={common.brand.full}>
        <BrandLogo className="login-aside-logo" priority />
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
          <BrandLogo className="mobile-brand" onLight />
          <div className="login-heading">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </div>

          <form key={mode} className="login-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <label className="field-label" htmlFor="name">
                  {t.signUp.name}
                </label>
                <div className="input-wrap">
                  <UserRound size={18} aria-hidden="true" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t.signUp.namePlaceholder}
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </div>
                <div className="field-spacer" />
              </>
            )}
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
              {!isSignUp && (
                <button className="text-button" type="button">
                  {t.forgotPassword}
                </button>
              )}
            </div>
            <div className="input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={copy.passwordPlaceholder}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                maxLength={72}
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
            {notice && (
              <p className="form-notice" role="status">
                {t.signUp.pendingNotice}
              </p>
            )}
            {error && (
              <p className="form-error" role="alert">
                {t.errors[error]}
              </p>
            )}
            <button
              className="button-primary login-submit"
              type="submit"
              disabled={pending}
            >
              {pending ? copy.submitting : copy.submit} <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {isSignUp ? t.signUp.haveAccount : t.noAccount}
            <button
              className="text-button"
              type="button"
              onClick={() => switchMode(isSignUp ? "signIn" : "signUp")}
            >
              {isSignUp ? t.signUp.signInLink : t.createAccount}
            </button>
          </p>
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
