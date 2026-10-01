"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  CloudDownload,
  FileText,
  Leaf,
  LogOut,
  Menu,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type SectionId = "general" | "automatic" | "manual" | "approval";

type Section = {
  id: SectionId;
  label: string;
  icon: LucideIcon;
};

const sections: Section[] = [
  { id: "general", label: "Informazioni generali", icon: Building2 },
  { id: "automatic", label: "ESG Automatico", icon: Sparkles },
  { id: "manual", label: "ESG Manuale", icon: FileText },
  { id: "approval", label: "Approvazione", icon: ClipboardCheck },
];

const sourceRows = [
  {
    name: "Consumi energetici",
    source: "Bolletta energia · Q4 2025",
    value: "184,2 MWh",
    state: "Verificato",
  },
  {
    name: "Emissioni Scope 1",
    source: "Registro flotta · 2025",
    value: "32,8 tCO₂e",
    state: "Verificato",
  },
  {
    name: "Consumi idrici",
    source: "Fatture acquedotto · 2025",
    value: "1.240 m³",
    state: "Da rivedere",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [approvalChecks, setApprovalChecks] = useState([false, false, false]);
  const [approved, setApproved] = useState(false);

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

  function toggleApproval(index: number) {
    setApprovalChecks((checks) =>
      checks.map((checked, itemIndex) =>
        itemIndex === index ? !checked : checked,
      ),
    );
    setApproved(false);
  }

  const currentSection =
    sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <main className="dashboard-shell">
      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Chiudi menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <a className="brand-lockup dashboard-brand" href="/dashboard">
            <span className="brand-mark">
              <Leaf size={20} strokeWidth={2.1} />
            </span>
            <span>
              Sustainability
              <span className="brand-lockup-second">Intelligence</span>
            </span>
          </a>
          <button
            className="icon-button mobile-close"
            aria-label="Chiudi menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="company-switcher">
          <span className="company-initial">N</span>
          <span className="company-switch-text">
            <strong>NordEst S.r.l.</strong>
            <small>Workspace aziendale</small>
          </span>
          <ChevronRight className="switch-chevron" size={16} />
        </button>
        <div className="sidebar-section-label">RACCOLTA DATI</div>
        <nav className="side-navigation" aria-label="Sezioni ESG">
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
                <Icon size={18} strokeWidth={1.8} />
                <span>{section.label}</span>
                {section.id === "approval" && (
                  <span className="nav-count">
                    {approved ? <Check size={12} /> : "1"}
                  </span>
                )}
                {index === 0 && !generalSaved && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-lower">
          <div className="sidebar-period">
            <span className="period-icon">
              <Activity size={16} />
            </span>
            <span>
              <small>PERIODO DI RENDICONTAZIONE</small>
              <strong>Anno fiscale 2025</strong>
            </span>
          </div>
          <div className="sidebar-help">
            <CircleHelp size={17} />
            <span>Hai bisogno di supporto?</span>
            <ChevronRight size={15} />
          </div>
          <button className="profile-row" onClick={handleLogout}>
            <span className="profile-avatar">MR</span>
            <span className="profile-meta">
              <strong>Marco Rossi</strong>
              <small>Amministratore</small>
            </span>
            <LogOut size={17} className="logout-icon" />
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Apri menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{currentSection.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="report-period">
              <span className="period-live-dot" />
              Rendicontazione 2025
            </span>
            <button
              className="icon-button notification-button"
              aria-label="Notifiche"
            >
              <Bell size={18} />
              <span />
            </button>
            <span className="topbar-divider" />
            <span className="topbar-avatar">MR</span>
          </div>
        </header>

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
          {activeSection === "approval" && (
            <ApprovalSection
              checks={approvalChecks}
              approved={approved}
              onToggle={toggleApproval}
              onApprove={() => setApproved(true)}
            />
          )}
          <footer className="dashboard-footer">
            <span>Ultimo aggiornamento: oggi, 09:42</span>
            <span>Salvataggio locale · Nessun dato inviato</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading-row">
      <div className="section-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
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
  return (
    <>
      <SectionHeading
        eyebrow="PROFILO AZIENDALE"
        title="Informazioni generali"
        description="I dati di base della tua organizzazione e del periodo di rendicontazione."
      />
      <div className="completion-banner">
        <div className="completion-icon">
          <Building2 size={20} />
        </div>
        <div className="completion-copy">
          <strong>Il profilo aziendale è pronto per essere completato</strong>
          <span>
            Completa i dati qui sotto per contestualizzare la tua
            rendicontazione ESG.
          </span>
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
            <h2>Anagrafica aziendale</h2>
            <p>Informazioni identificative dell’organizzazione.</p>
          </div>
          <span className="required-note">* Campi obbligatori</span>
        </div>
        <div className="form-grid">
          <label className="form-field form-field-wide">
            <span>
              Ragione sociale <b>*</b>
            </span>
            <input defaultValue="NordEst S.r.l." required />
          </label>
          <label className="form-field">
            <span>
              Partita IVA <b>*</b>
            </span>
            <input defaultValue="IT 02849310231" required />
          </label>
          <label className="form-field">
            <span>Codice ATECO</span>
            <input defaultValue="25.11.00" />
          </label>
          <label className="form-field">
            <span>Settore di attività</span>
            <select defaultValue="manifatturiero">
              <option value="manifatturiero">Manifatturiero</option>
              <option value="servizi">Servizi</option>
              <option value="commercio">Commercio</option>
              <option value="altro">Altro</option>
            </select>
          </label>
          <label className="form-field">
            <span>Numero di dipendenti</span>
            <input type="number" defaultValue="86" min="0" />
          </label>
          <label className="form-field">
            <span>Paese principale</span>
            <select defaultValue="italia">
              <option value="italia">Italia</option>
              <option value="francia">Francia</option>
              <option value="germania">Germania</option>
              <option value="altro">Altro</option>
            </select>
          </label>
          <label className="form-field">
            <span>Anno di rendicontazione</span>
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
            <CheckCircle2 size={15} /> Modifiche salvate in questa sessione
          </span>
          <button className="button-primary" type="submit">
            <Save size={16} /> Salva informazioni
          </button>
        </div>
      </form>
      <div className="info-footnote">
        <ShieldCheck size={17} />
        <span>
          I dati sono utilizzati esclusivamente per la tua analisi di
          sostenibilità.
        </span>
        <button aria-label="Maggiori informazioni">
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
  return (
    <>
      <SectionHeading
        eyebrow="RACCOLTA DATI · AUTOMATICA"
        title="ESG Automatico"
        description="Indicatori raccolti da fonti aziendali e documenti disponibili."
        action={
          <button className="button-secondary" onClick={onRefresh}>
            <RefreshCw size={16} className={refreshed ? "refresh-done" : ""} />{" "}
            Aggiorna dati
          </button>
        }
      />
      <div className="automatic-summary">
        <div className="summary-metric">
          <span className="metric-kicker">FONTI COLLEGATE</span>
          <strong>
            08 <small>/ 10</small>
          </strong>
          <span className="metric-caption">2 fonti da configurare</span>
        </div>
        <div className="summary-separator" />
        <div className="summary-metric">
          <span className="metric-kicker">INDICATORI RACCOLTI</span>
          <strong>
            24 <small>/ 31</small>
          </strong>
          <span className="metric-caption">77% di copertura</span>
        </div>
        <div className="summary-separator" />
        <div className="summary-metric">
          <span className="metric-kicker">ULTIMA SINCRONIZZAZIONE</span>
          <strong className="sync-time">
            {refreshed ? "Adesso" : "Oggi, 09:42"}
          </strong>
          <span className="metric-caption">Prossimo controllo domani</span>
        </div>
        <div className="summary-icon">
          <CloudDownload size={19} />
        </div>
      </div>
      <div className="content-panel">
        <div className="panel-heading-row">
          <div>
            <h2>Indicatori acquisiti</h2>
            <p>Valori rilevati nel periodo di rendicontazione 2025.</p>
          </div>
          <button className="filter-button">
            Tutti gli indicatori <ChevronRight size={15} />
          </button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>INDICATORE</th>
                <th>FONTE</th>
                <th>VALORE RILEVATO</th>
                <th>STATO</th>
                <th>
                  <span className="sr-only">Apri</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sourceRows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.source}</td>
                  <td className="table-value">{row.value}</td>
                  <td>
                    <span
                      className={`status-pill ${row.state === "Verificato" ? "status-verified" : "status-review"}`}
                    >
                      <span />
                      {row.state}
                    </span>
                  </td>
                  <td>
                    <button
                      className="row-arrow"
                      aria-label={`Apri ${row.name}`}
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
            <span className="table-dot" /> Sincronizzazione completata
          </span>
          <button className="text-button">
            Visualizza tutte le fonti <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="auto-note">
        <Sparkles size={17} />
        <p>
          <strong>Raccolta intelligente</strong>
          <br />I dati vengono organizzati per indicatore. Rivedi le fonti
          contrassegnate prima di procedere all’approvazione.
        </p>
        <button className="icon-button" aria-label="Scarica riepilogo">
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
  return (
    <>
      <SectionHeading
        eyebrow="RACCOLTA DATI · MANUALE"
        title="ESG Manuale"
        description="Inserisci gli indicatori qualitativi e quantitativi non disponibili in automatico."
        action={
          <span className="draft-pill">
            <span /> BOZZA
          </span>
        }
      />
      <div className="manual-progress">
        <div className="manual-progress-icon">
          <FileText size={19} />
        </div>
        <div className="manual-progress-text">
          <strong>La tua raccolta manuale</strong>
          <span>4 indicatori completati su 12</span>
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
            <h2>Ambiente</h2>
            <p>Impatto ambientale e gestione delle risorse.</p>
          </div>
          <span className="section-count">01 — 04</span>
        </div>
        <div className="manual-fields">
          <label className="form-field">
            <span>
              Energia da fonti rinnovabili <b>*</b>
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
            <small>Percentuale sul consumo energetico totale.</small>
          </label>
          <label className="form-field">
            <span>Rifiuti avviati a riciclo</span>
            <div className="unit-input">
              <input type="number" defaultValue="62" min="0" max="100" />
              <span>%</span>
            </div>
            <small>Quota di rifiuti destinata al recupero.</small>
          </label>
          <label className="form-field form-field-full">
            <span>Iniziative di riduzione dell’impatto</span>
            <textarea
              rows={4}
              placeholder="Descrivi le iniziative attuate nel periodo..."
              defaultValue="Installazione di illuminazione LED nei reparti produttivi e ottimizzazione dei cicli di lavorazione."
            />
          </label>
        </div>
        <div className="form-actions">
          <span
            className={`save-feedback ${saved ? "save-feedback-visible" : ""}`}
          >
            <CheckCircle2 size={15} /> Bozza salvata in questa sessione
          </span>
          <button className="button-primary" type="submit">
            <Save size={16} /> Salva bozza
          </button>
        </div>
      </form>
      <div className="manual-next-row">
        <span>
          <Clock3 size={16} /> Puoi completare la raccolta in più momenti.
        </span>
        <button className="button-secondary" type="button">
          Prossima sezione <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

function ApprovalSection({
  checks,
  approved,
  onToggle,
  onApprove,
}: {
  checks: boolean[];
  approved: boolean;
  onToggle: (index: number) => void;
  onApprove: () => void;
}) {
  const reviewItems = [
    "Le informazioni generali dell’azienda sono corrette.",
    "I dati ESG automatici sono stati verificati.",
    "Gli indicatori ESG manuali sono completi.",
  ];
  const readyToApprove = checks.every(Boolean);

  return (
    <>
      <SectionHeading
        eyebrow="CHIUSURA DELLA RACCOLTA"
        title="Approvazione"
        description="Rivedi le informazioni prima di confermare la rendicontazione."
      />
      <div
        className={`approval-banner ${approved ? "approval-banner-done" : ""}`}
      >
        <span className="approval-banner-icon">
          {approved ? <CheckCircle2 size={22} /> : <ShieldCheck size={22} />}
        </span>
        <div>
          <strong>
            {approved ? "Rendicontazione approvata" : "Quasi tutto pronto"}
          </strong>
          <p>
            {approved
              ? "La conferma è stata registrata in questa sessione."
              : "Completa la verifica finale per approvare i dati ESG 2025."}
          </p>
        </div>
        <span
          className={`approval-status ${approved ? "approval-status-done" : ""}`}
        >
          {approved ? "APPROVATO" : "IN REVISIONE"}
        </span>
      </div>
      <div className="approval-layout">
        <div className="content-panel review-panel">
          <div className="panel-heading-row">
            <div>
              <h2>Checklist di verifica</h2>
              <p>Conferma ogni voce per procedere.</p>
            </div>
            <span className="check-counter">
              {checks.filter(Boolean).length} / {checks.length}
            </span>
          </div>
          <div className="review-list">
            {reviewItems.map((item, index) => (
              <label
                className={`review-item ${checks[index] ? "review-item-checked" : ""}`}
                key={item}
              >
                <input
                  type="checkbox"
                  checked={checks[index]}
                  onChange={() => onToggle(index)}
                />
                <span className="custom-checkbox">
                  {checks[index] && <Check size={13} />}
                </span>
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="review-footer">
            <span>
              <ShieldCheck size={16} /> La conferma è reversibile in questa
              demo.
            </span>
            <button
              className="button-primary"
              type="button"
              disabled={!readyToApprove || approved}
              onClick={onApprove}
            >
              {approved ? (
                <>
                  <Check size={16} /> Approvato
                </>
              ) : (
                <>
                  Conferma approvazione <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
        <aside className="approval-side-note">
          <div className="side-note-icon">
            <ClipboardCheck size={20} />
          </div>
          <span className="eyebrow">RIEPILOGO</span>
          <h2>Il tuo percorso ESG</h2>
          <div className="approval-step">
            <span className="step-check">
              <Check size={12} />
            </span>
            <div>
              <strong>Informazioni generali</strong>
              <small>Profilo aziendale inserito</small>
            </div>
          </div>
          <div className="approval-step">
            <span className="step-check">
              <Check size={12} />
            </span>
            <div>
              <strong>ESG Automatico</strong>
              <small>Fonti sincronizzate</small>
            </div>
          </div>
          <div className="approval-step approval-step-current">
            <span className="step-number">3</span>
            <div>
              <strong>ESG Manuale</strong>
              <small>Indicatori da confermare</small>
            </div>
          </div>
          <div className="approval-step approval-step-pending">
            <span className="step-number">4</span>
            <div>
              <strong>Approvazione</strong>
              <small>In attesa della revisione</small>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
