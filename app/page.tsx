"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.setItem("sustainability-demo-session", "active");
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label="Sustainability Intelligence">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark">
            <Leaf size={21} strokeWidth={2.1} />
          </span>
          <span>
            Sustainability
            <span className="brand-lockup-second">Intelligence</span>
          </span>
        </div>
        <div className="login-aside-copy">
          <span className="eyebrow eyebrow-light">
            MISURA · COMPRENDI · MIGLIORA
          </span>
          <h1>
            La sostenibilità,
            <br />
            resa concreta.
          </h1>
          <p>
            Un unico spazio per raccogliere, leggere e valorizzare le
            performance ESG della tua azienda.
          </p>
        </div>
        <div className="aside-footer">
          <span className="status-dot" /> La tua piattaforma ESG
        </div>
        <div className="login-art" aria-hidden="true">
          <div className="art-ring art-ring-one" />
          <div className="art-ring art-ring-two" />
          <div className="art-leaf">
            <Leaf size={110} strokeWidth={0.8} />
          </div>
          <span className="art-coordinate">
            44°29&apos; N<br />
            11°20&apos; E
          </span>
        </div>
      </section>

      <section className="login-main">
        <div className="login-card-wrap">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark">
              <Leaf size={21} strokeWidth={2.1} />
            </span>
            <span>
              Sustainability
              <span className="brand-lockup-second">Intelligence</span>
            </span>
          </div>
          <div className="login-heading">
            <span className="eyebrow">AREA RISERVATA</span>
            <h2>Bentornato.</h2>
            <p>Accedi al tuo spazio di sostenibilità aziendale.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email aziendale
            </label>
            <div className="input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nome@azienda.it"
                autoComplete="email"
                required
              />
            </div>
            <div className="password-label-row">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <button className="text-button" type="button">
                Password dimenticata?
              </button>
            </div>
            <div className="input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci la password"
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                className="icon-button password-toggle"
                type="button"
                aria-label={
                  showPassword ? "Nascondi password" : "Mostra password"
                }
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="button-primary login-submit" type="submit">
              Accedi alla piattaforma <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-note">
            <span className="note-rule" />
            Accesso dimostrativo
            <span className="note-rule" />
          </div>
          <p className="login-legal">
            Proseguendo, dichiari di aver letto l’informativa sulla privacy.
          </p>
        </div>
        <div className="login-copyright">
          © 2026 Sustainability Intelligence
        </div>
      </section>
    </main>
  );
}
