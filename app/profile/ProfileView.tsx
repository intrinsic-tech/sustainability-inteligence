"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleUserRound, Save } from "lucide-react";
import { updateProfile, type ProfileErrorCode } from "@/app/actions/profile";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/i18n";

export function ProfileView({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const t = useTranslations("profile");
  const [displayName, setDisplayName] = useState(name);
  const [error, setError] = useState<ProfileErrorCode | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (!result.ok) {
        if (result.error === "unauthorized") {
          router.replace("/");
          return;
        }
        setError(result.error);
        return;
      }
      setDisplayName(result.name);
      setSaved(true);
      for (const field of ["currentPassword", "newPassword", "confirmPassword"]) {
        (form.elements.namedItem(field) as HTMLInputElement).value = "";
      }
      router.refresh();
    });
  }

  return (
    <main className="dashboard-shell">
      <header className="app-header">
        <Link className="app-brand" href="/dashboard">
          <BrandLogo className="app-logo" onLight priority />
        </Link>
        <div className="header-actions">
          <LanguageSwitcher />
          <span className="header-user">
            <span className="header-user-name">{displayName}</span>
            <CircleUserRound size={36} strokeWidth={1.6} />
          </span>
        </div>
      </header>

      <section className="dashboard-main profile-main">
        <div className="dashboard-content">
          <Link className="text-button profile-back" href="/dashboard">
            <ArrowLeft size={16} /> {t.back}
          </Link>
          <div className="section-heading-row">
            <div className="section-heading">
              <h1>{t.title}</h1>
              <p>{t.description}</p>
            </div>
          </div>

          <form className="manual-form" onSubmit={handleSubmit}>
            <div className="form-section-head">
              <div>
                <h2>{t.detailsTitle}</h2>
                <p>{email}</p>
              </div>
            </div>
            <div className="manual-fields">
              <label className="form-field form-field-full">
                <span>
                  {t.name} <b>*</b>
                </span>
                <input
                  name="name"
                  type="text"
                  defaultValue={name}
                  autoComplete="name"
                  required
                  maxLength={120}
                />
              </label>
            </div>

            <div className="form-section-head">
              <div>
                <h2>{t.passwordTitle}</h2>
                <p>{t.passwordDescription}</p>
              </div>
            </div>
            <div className="manual-fields">
              <label className="form-field form-field-full">
                <span>{t.currentPassword}</span>
                <input
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  maxLength={72}
                />
              </label>
              <label className="form-field">
                <span>{t.newPassword}</span>
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={72}
                />
                <small>{t.newPasswordHint}</small>
              </label>
              <label className="form-field">
                <span>{t.confirmPassword}</span>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  maxLength={72}
                />
              </label>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {t.errors[error]}
              </p>
            )}
            <div className="form-actions">
              <span
                className={`save-feedback ${saved ? "save-feedback-visible" : ""}`}
                role="status"
              >
                <CheckCircle2 size={15} /> {t.saved}
              </span>
              <button className="button-primary" type="submit" disabled={pending}>
                <Save size={16} /> {pending ? t.saving : t.save}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
