"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleUserRound,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlugZap,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ShieldUser,
  Sparkles,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { format, useTranslations } from "@/i18n";

type SectionId = "general" | "automatic" | "manual";

const sections: { id: SectionId; icon: LucideIcon }[] = [
  { id: "general", icon: LayoutDashboard },
  { id: "automatic", icon: Sparkles },
  { id: "manual", icon: FileText },
];

const unreadNotifications = 3;

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("admin");

  useEffect(() => {
    if (sessionStorage.getItem("sustainability-demo-session") !== "active") {
      router.replace("/");
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("sustainability-demo-session");
    router.push("/");
  }

  function handleGeneralSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralSaved(true);
  }

  function handleManualSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualSaved(true);
  }

  return (
    <main className="dashboard-shell">
      <header className="app-header">
        <button
          className="icon-button mobile-menu"
          aria-label={t.header.openMenu}
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={22} />
        </button>
        <a className="app-brand" href="/dashboard">
          <BrandLogo className="app-logo" onLight priority />
        </a>
        <label className="header-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">{t.header.searchLabel}</span>
          <input type="search" placeholder={t.header.searchPlaceholder} />
        </label>
        <div className="header-actions">
          <LanguageSwitcher />
          <button
            className="icon-button notification-button"
            aria-label={format(t.header.notifications, {
              count: unreadNotifications,
            })}
          >
            <Bell size={22} fill="currentColor" />
            <span className="notification-badge">{unreadNotifications}</span>
          </button>
          <span className="header-user">
            <span className="header-user-name">Marco Rossi</span>
            <CircleUserRound size={36} strokeWidth={1.6} />
          </span>
        </div>
      </header>

      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label={t.header.closeMenu}
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-mobile-head">
          <LanguageSwitcher className="sidebar-lang" />
          <button
            className="icon-button mobile-close"
            aria-label={t.header.closeMenu}
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="role-toggle" role="group" aria-label={t.sidebar.viewLabel}>
          <button
            className={role === "admin" ? "role-active" : ""}
            aria-pressed={role === "admin"}
            onClick={() => setRole("admin")}
          >
            <ShieldUser size={20} />
            {t.sidebar.admin}
          </button>
          <button
            className={role === "user" ? "role-active" : ""}
            aria-pressed={role === "user"}
            onClick={() => setRole("user")}
          >
            <CircleUserRound size={20} />
            {t.sidebar.user}
          </button>
        </div>
        <div className="sidebar-divider" />
        <nav className="side-navigation" aria-label={t.sidebar.navLabel}>
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? "nav-item-active" : ""}`}
                onClick={() => {
                  setActiveSection(section.id);
                  setMobileNavOpen(false);
                }}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={2} />
                <span>{t.sections[section.id]}</span>
                {index === 0 && !generalSaved && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-lower">
          <div className="sidebar-divider" />
          <div className="sidebar-period">
            <span className="period-icon">
              <Activity size={18} />
            </span>
            <span>
              <small>{t.sidebar.periodLabel}</small>
              <strong>{t.sidebar.periodValue}</strong>
            </span>
          </div>
          <button className="nav-item">
            <CircleHelp size={22} strokeWidth={2} />
            <span>{t.sidebar.support}</span>
          </button>
          <button className="nav-item nav-item-logout" onClick={handleLogout}>
            <LogOut size={22} strokeWidth={2} />
            <span>{t.sidebar.logout}</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-content">
          {activeSection === "general" && (
            <GeneralSection saved={generalSaved} onSave={handleGeneralSave} />
          )}
          {activeSection === "automatic" && (
            <AutomaticSection
              refreshed={refreshed}
              onRefresh={() => setRefreshed(true)}
            />
          )}
          {activeSection === "manual" && (
            <ManualSection saved={manualSaved} onSave={handleManualSave} />
          )}
          <footer className="dashboard-footer">
            <span>{t.footer.lastUpdate}</span>
            <span>{t.footer.localSave}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading-row">
      <div className="section-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: "teal" | "red" | "green" | "blue";
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <span className={`stat-icon stat-icon-${tone}`}>
        <Icon size={24} strokeWidth={2.2} />
      </span>
      <span className="stat-text">
        <span>{label}</span>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function GeneralSection({
  saved,
  onSave,
}: {
  saved: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const sectionTitle = useTranslations("dashboard").sections.general;
  const t = useTranslations("dashboard").general;

  return (
    <>
      <SectionHeading title={sectionTitle} description={t.description} />
      <div className="completion-banner">
        <div className="completion-icon">
          <Building2 size={20} />
        </div>
        <div className="completion-copy">
          <strong>{t.bannerTitle}</strong>
          <span>{t.bannerText}</span>
        </div>
        <div className="completion-progress">
          <span>75%</span>
          <div className="progress-track">
            <i />
          </div>
        </div>
      </div>
      <form className="data-form" onSubmit={onSave}>
        <div className="form-section-head">
          <div>
            <h2>{t.formTitle}</h2>
            <p>{t.formDescription}</p>
          </div>
          <span className="required-note">{t.requiredNote}</span>
        </div>
        <div className="form-grid">
          <label className="form-field form-field-wide">
            <span>
              {t.companyName} <b>*</b>
            </span>
            <input defaultValue="NordEst S.r.l." required />
          </label>
          <label className="form-field">
            <span>
              {t.vatNumber} <b>*</b>
            </span>
            <input defaultValue="IT 02849310231" required />
          </label>
          <label className="form-field">
            <span>{t.atecoCode}</span>
            <input defaultValue="25.11.00" />
          </label>
          <label className="form-field">
            <span>{t.sector}</span>
            <select defaultValue="manufacturing">
              {Object.entries(t.sectors).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>{t.employees}</span>
            <input type="number" defaultValue="86" min="0" />
          </label>
          <label className="form-field">
            <span>{t.country}</span>
            <select defaultValue="italy">
              {Object.entries(t.countries).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>{t.reportingYear}</span>
            <select defaultValue="2025">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <span
            className={`save-feedback ${saved ? "save-feedback-visible" : ""}`}
          >
            <CheckCircle2 size={15} /> {t.saved}
          </span>
          <button className="button-primary" type="submit">
            <Save size={16} /> {t.save}
          </button>
        </div>
      </form>
      <div className="info-footnote">
        <ShieldCheck size={17} />
        <span>{t.footnote}</span>
        <button aria-label={t.moreInfo}>
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

function AutomaticSection({
  refreshed,
  onRefresh,
}: {
  refreshed: boolean;
  onRefresh: () => void;
}) {
  const sectionTitle = useTranslations("dashboard").sections.automatic;
  const t = useTranslations("dashboard").automatic;

  return (
    <>
      <SectionHeading
        title={sectionTitle}
        description={t.description}
        action={
          <button className="button-secondary" onClick={onRefresh}>
            <RefreshCw size={16} className={refreshed ? "refresh-done" : ""} />{" "}
            {t.refresh}
          </button>
        }
      />
      <div className="stat-grid">
        <StatCard
          icon={PlugZap}
          tone="teal"
          label={t.connectedSources}
          value={
            <>
              8 <small>/ 10</small>
            </>
          }
        />
        <StatCard
          icon={TriangleAlert}
          tone="red"
          label={t.toReview}
          value="1"
        />
        <StatCard
          icon={CircleCheck}
          tone="green"
          label={t.collectedIndicators}
          value={
            <>
              24 <small>/ 31</small>
            </>
          }
        />
        <StatCard
          icon={RefreshCw}
          tone="blue"
          label={t.lastSync}
          value={refreshed ? t.now : "09:42"}
        />
      </div>
      <div className="content-panel">
        <div className="panel-heading-row">
          <div>
            <h2>{t.panelTitle}</h2>
            <p>{t.panelDescription}</p>
          </div>
          <button className="filter-button">
            {t.allIndicators} <ChevronRight size={15} />
          </button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.columns.indicator}</th>
                <th>{t.columns.source}</th>
                <th>{t.columns.value}</th>
                <th>{t.columns.status}</th>
                <th>
                  <span className="sr-only">{t.columns.open}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.source}</td>
                  <td className="table-value">{row.value}</td>
                  <td>
                    <span
                      className={`status-pill ${row.status === "verified" ? "status-verified" : "status-review"}`}
                    >
                      <span />
                      {row.status === "verified"
                        ? t.status.verified
                        : t.status.review}
                    </span>
                  </td>
                  <td>
                    <button
                      className="row-arrow"
                      aria-label={format(t.openRow, { name: row.name })}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-bottom">
          <span>
            <span className="table-dot" /> {t.syncCompleted}
          </span>
          <button className="text-button">
            {t.viewAllSources} <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="auto-note">
        <Sparkles size={17} />
        <p>
          <strong>{t.noteTitle}</strong>
          <br />
          {t.noteText}
        </p>
        <button className="icon-button" aria-label={t.downloadSummary}>
          <ArrowDownToLine size={17} />
        </button>
      </div>
    </>
  );
}

function ManualSection({
  saved,
  onSave,
}: {
  saved: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const sectionTitle = useTranslations("dashboard").sections.manual;
  const t = useTranslations("dashboard").manual;

  return (
    <>
      <SectionHeading
        title={sectionTitle}
        description={t.description}
        action={
          <span className="draft-pill">
            <span /> {t.draft}
          </span>
        }
      />
      <div className="manual-progress">
        <div className="manual-progress-icon">
          <FileText size={19} />
        </div>
        <div className="manual-progress-text">
          <strong>{t.progressTitle}</strong>
          <span>{format(t.progressText, { done: 4, total: 12 })}</span>
        </div>
        <div className="manual-progress-meter">
          <span>33%</span>
          <div className="progress-track">
            <i />
          </div>
        </div>
      </div>
      <form className="manual-form" onSubmit={onSave}>
        <div className="form-section-head">
          <div>
            <h2>{t.formTitle}</h2>
            <p>{t.formDescription}</p>
          </div>
          <span className="section-count">01 — 04</span>
        </div>
        <div className="manual-fields">
          <label className="form-field">
            <span>
              {t.renewableEnergy} <b>*</b>
            </span>
            <div className="unit-input">
              <input
                type="number"
                defaultValue="38"
                min="0"
                max="100"
                required
              />
              <span>%</span>
            </div>
            <small>{t.renewableEnergyHint}</small>
          </label>
          <label className="form-field">
            <span>{t.recycledWaste}</span>
            <div className="unit-input">
              <input type="number" defaultValue="62" min="0" max="100" />
              <span>%</span>
            </div>
            <small>{t.recycledWasteHint}</small>
          </label>
          <label className="form-field form-field-full">
            <span>{t.initiatives}</span>
            <textarea
              rows={4}
              placeholder={t.initiativesPlaceholder}
              defaultValue={t.initiativesDefault}
            />
          </label>
        </div>
        <div className="form-actions">
          <span
            className={`save-feedback ${saved ? "save-feedback-visible" : ""}`}
          >
            <CheckCircle2 size={15} /> {t.saved}
          </span>
          <button className="button-primary" type="submit">
            <Save size={16} /> {t.save}
          </button>
        </div>
      </form>
      <div className="manual-next-row">
        <span>
          <Clock3 size={16} /> {t.nextHint}
        </span>
        <button className="button-secondary" type="button">
          {t.nextSection} <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}


