"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Inbox,
  LoaderCircle,
  Plus,
  Send,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";
import { useTranslations } from "@/i18n";
import type {
  DocumentsResponse,
  EnvironmentalSection,
  GeneralInformation,
  Theme,
  ThemedSection,
} from "@/types/report";

type TabId = "general" | "environmental" | "social" | "governance";
type SubmitError = "validation" | "create" | "documents" | "network";
type Messages = ReturnType<typeof useTranslations<"reportV1">>;

const tabs: TabId[] = ["general", "environmental", "social", "governance"];

const fields = [
  { name: "company_name", label: "companyName", placeholder: "Storo Diesel S.r.l.", required: true },
  { name: "vat_number", label: "vatNumber", placeholder: "00604430223" },
  { name: "fiscal_code", label: "fiscalCode", placeholder: "00604430223" },
  { name: "bank_id", label: "bankId", placeholder: "banca_valsabbina" },
  { name: "website_url", label: "websiteUrl", placeholder: "https://www.storodiesel.it", type: "url", wide: true },
] as const;

const uploads = [
  { name: "visura_file", label: "visura", accept: ".pdf,application/pdf", icon: FileText },
  { name: "xbrl_file_1", label: "xbrlCurrent", accept: ".xbrl,.xml", icon: FileSpreadsheet },
  { name: "xbrl_file_2", label: "xbrlPrior", accept: ".xbrl,.xml", icon: FileSpreadsheet },
] as const;

type UploadName = (typeof uploads)[number]["name"];

export function ReportV1({
  title,
  report,
  onReport,
}: {
  title: string;
  report: DocumentsResponse | null;
  onReport: (report: DocumentsResponse | null) => void;
}) {
  const t = useTranslations("reportV1");
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const v1 = report?.report_v1;

  return (
    <>
      <div className="section-heading-row">
        <div className="section-heading">
          <h1>{title}</h1>
          <p>{t.description}</p>
        </div>
        {report && (
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              onReport(null);
              setActiveTab("general");
            }}
          >
            <Plus size={16} /> {t.newReport}
          </button>
        )}
      </div>

      <div className="report-tabs" role="tablist" aria-label={title}>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            id={`report-tab-${tab}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            aria-controls={`report-panel-${tab}`}
            className={`report-tab ${activeTab === tab ? "report-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="report-tab-index">{index + 1}</span>
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* Panels stay mounted so typed values and chosen files survive tab switches. */}
      <TabPanel tab="general" active={activeTab}>
        {report ? (
          <GeneralResult t={t} report={report} info={v1?.general_information} />
        ) : (
          <IntakeForm t={t} onReport={onReport} />
        )}
      </TabPanel>
      <TabPanel tab="environmental" active={activeTab}>
        {v1?.environmental ? (
          <EnvironmentalResult t={t} section={v1.environmental} />
        ) : (
          <EmptyTab t={t} />
        )}
      </TabPanel>
      <TabPanel tab="social" active={activeTab}>
        {v1?.social ? <ThemeList t={t} section={v1.social} /> : <EmptyTab t={t} />}
      </TabPanel>
      <TabPanel tab="governance" active={activeTab}>
        {v1?.governance ? (
          <ThemeList t={t} section={v1.governance} />
        ) : (
          <EmptyTab t={t} />
        )}
      </TabPanel>
    </>
  );
}

function TabPanel({
  tab,
  active,
  children,
}: {
  tab: TabId;
  active: TabId;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`report-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`report-tab-${tab}`}
      hidden={tab !== active}
    >
      {children}
    </div>
  );
}

function IntakeForm({
  t,
  onReport,
}: {
  t: Messages;
  onReport: (report: DocumentsResponse) => void;
}) {
  const [files, setFiles] = useState<Partial<Record<UploadName, File>>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SubmitError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (uploads.some(({ name }) => !files[name])) {
      setError("validation");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) {
        console.error("Report generation failed", body);
        setError(body?.error ?? "create");
        return;
      }
      onReport(body as DocumentsResponse);
    } catch (cause) {
      console.error("Report generation failed", cause);
      setError("network");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="data-form" onSubmit={handleSubmit}>
      <div className="form-section-head">
        <div>
          <h2>{t.form.title}</h2>
          <p>{t.form.description}</p>
        </div>
        <span className="required-note">{t.form.requiredNote}</span>
      </div>
      <fieldset className="form-grid report-fieldset" disabled={pending}>
        {fields.map((field) => (
          <label
            key={field.name}
            className={`form-field ${"wide" in field ? "form-field-wide" : ""}`}
          >
            <span>
              {t.form[field.label]} {"required" in field && <b>*</b>}
            </span>
            <input
              name={field.name}
              type={"type" in field ? field.type : "text"}
              placeholder={field.placeholder}
              required={"required" in field}
            />
          </label>
        ))}
        <label className="form-field form-field-full">
          <span>{t.form.notes}</span>
          <textarea name="notes" placeholder="Analisi prototipo Storo Diesel" />
        </label>
      </fieldset>

      <div className="form-section-head">
        <div>
          <h2>{t.uploads.title}</h2>
          <p>{t.uploads.description}</p>
        </div>
      </div>
      <div className="upload-grid">
        {uploads.map(({ name, label, accept, icon: Icon }) => {
          const file = files[name];
          return (
            <label
              key={name}
              className={`upload-zone ${file ? "upload-zone-filled" : ""}`}
            >
              <input
                type="file"
                name={name}
                accept={accept}
                required
                disabled={pending}
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  setFiles((current) => ({ ...current, [name]: selected }));
                }}
              />
              <span className="upload-icon">
                {file ? <CheckCircle2 size={22} /> : <Icon size={22} />}
              </span>
              <strong>
                {t.uploads[label]} <b>*</b>
              </strong>
              {file ? (
                <span className="upload-file">
                  {file.name} · {formatSize(file.size)}
                  <small>{t.uploads.replace}</small>
                </span>
              ) : (
                <span className="upload-hint">
                  <UploadCloud size={15} /> {t.uploads.choose}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="report-error" role="alert">
          <TriangleAlert size={16} /> {t.errors[error]}
        </p>
      )}
      <div className="form-actions">
        <span className="report-pending" aria-live="polite">
          {pending && (
            <>
              <LoaderCircle size={16} className="spin" /> {t.submitting}
            </>
          )}
        </span>
        <button className="button-primary" type="submit" disabled={pending}>
          <Send size={16} /> {t.submit}
        </button>
      </div>
    </form>
  );
}

function GeneralResult({
  t,
  report,
  info,
}: {
  t: Messages;
  report: DocumentsResponse;
  info?: GeneralInformation;
}) {
  const fieldLabels: Record<string, string> = t.result.fields;
  const financials = info?.financial_metrics;

  return (
    <>
      <div className="completion-banner report-success">
        <div className="completion-icon">
          <CheckCircle2 size={22} />
        </div>
        <div className="completion-copy">
          <strong>{t.result.success}</strong>
          <span>
            {t.result.reportId}: <code>{report.report_id}</code>
          </span>
        </div>
      </div>

      <div className="report-grid">
        <KeyValuePanel title={t.result.identity} data={info?.identity} labels={fieldLabels} />
        <KeyValuePanel title={t.result.workforce} data={info?.workforce} labels={fieldLabels} />
      </div>

      <KeyValuePanel
        title={
          financials?.target_year
            ? `${t.result.financials} · ${financials.target_year}`
            : t.result.financials
        }
        data={financials}
        labels={fieldLabels}
        columns={3}
      />

      {financials?.history && financials.history.length > 0 && (
        <Panel title={t.result.history}>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t.result.year}</th>
                  <th>{t.result.revenue}</th>
                  <th>{t.result.mol}</th>
                  <th>{t.result.molMargin}</th>
                </tr>
              </thead>
              <tbody>
                {financials.history.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{row.revenue_formatted ?? "–"}</td>
                    <td>{row.mol_formatted ?? "–"}</td>
                    <td>{row.mol_margin ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel title={t.result.flags}>
        {info?.flags && info.flags.length > 0 ? (
          <ul className="flag-list">
            {info.flags.map((flag) => (
              <li key={flag.code} className={`flag flag-${flag.severity}`}>
                <TriangleAlert size={16} />
                <div>
                  <strong>{flag.code}</strong>
                  <span>{flag.message}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-muted">{t.result.noFlags}</p>
        )}
      </Panel>

      <div className="report-grid">
        {info?.locations && info.locations.length > 0 && (
          <Panel title={t.result.locations}>
            <ul className="plain-list">
              {info.locations.map((location) => (
                <li key={location.id}>
                  <strong>{location.address}</strong>
                  <small>
                    {location.type}
                    {location.included === false && ` · ${t.result.excluded}`}
                  </small>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <Panel title={t.result.documents}>
          <ul className="plain-list">
            {report.documents_ingested.map((document) => (
              <li key={document.id}>
                <strong>{document.filename}</strong>
                <small>
                  {document.document_type} · {formatSize(document.size_bytes)}
                </small>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {info?.website_summary?.business_model && (
        <Panel title={t.result.website}>
          <p className="panel-text">{info.website_summary.business_model}</p>
          {info.website_summary.key_activities && (
            <ul className="bullet-list">
              {info.website_summary.key_activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </>
  );
}

function EnvironmentalResult({
  t,
  section,
}: {
  t: Messages;
  section: EnvironmentalSection;
}) {
  const summary = section.site_summary;

  return (
    <>
      {summary?.hazard_summary_table && summary.hazard_summary_table.length > 0 && (
        <Panel
          title={t.hazards.title}
          aside={
            summary.overall_score_formatted && (
              <span className="hazard-overall">
                {t.hazards.overall}: <strong>{summary.overall_score_formatted}</strong>
                {summary.overall_rating && ` · ${summary.overall_rating}`}
                {summary.overall_rating_label && ` (${summary.overall_rating_label})`}
              </span>
            )
          }
        >
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t.hazards.hazard}</th>
                  <th>{t.hazards.score}</th>
                  <th>{t.hazards.today}</th>
                  <th>{t.hazards.in2050}</th>
                  <th>{t.hazards.trend}</th>
                </tr>
              </thead>
              <tbody>
                {summary.hazard_summary_table.map((row) => (
                  <tr key={row.hazard_key} className={row.is_major ? "row-major" : ""}>
                    <td>{row.hazard_label_it}</td>
                    <td>{row.score_formatted}</td>
                    <td>{row.rating_today}</td>
                    <td>{row.rating_2050}</td>
                    <td>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <ThemeList t={t} section={section} />
    </>
  );
}

function ThemeList({ t, section }: { t: Messages; section: ThemedSection }) {
  const themes = Object.values(section.themes ?? {});
  if (themes.length === 0) return <EmptyTab t={t} />;
  return (
    <>
      {themes.map((theme) => (
        <ThemeCard key={theme.id} t={t} theme={theme} />
      ))}
    </>
  );
}

function ThemeCard({ t, theme }: { t: Messages; theme: Theme }) {
  const statusLabels: Record<string, string> = t.theme.status;

  return (
    <article className="content-panel theme-card">
      <header className="theme-head">
        <div>
          <span className="eyebrow">{theme.id}</span>
          <h2>{theme.title}</h2>
          {theme.kicker && <p>{theme.kicker}</p>}
        </div>
        <div className="theme-badges">
          <span className={`theme-status theme-status-${theme.status}`}>
            {statusLabels[theme.status] ?? theme.status}
          </span>
          {theme.risk_level != null && (
            <span className="theme-level">
              {t.theme.risk} {theme.risk_level}/5
            </span>
          )}
          {theme.opportunity_level != null && (
            <span className="theme-level">
              {t.theme.opportunity} {theme.opportunity_level}/5
            </span>
          )}
        </div>
      </header>

      <div className="theme-body">
        {theme.why_material && (
          <ThemeBlock title={t.theme.whyMaterial}>
            <p>{theme.why_material}</p>
          </ThemeBlock>
        )}
        {theme.analysis && theme.analysis.length > 0 && (
          <ThemeBlock title={t.theme.analysis}>
            {theme.analysis.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </ThemeBlock>
        )}
        {theme.evidence && theme.evidence.length > 0 && (
          <ThemeBlock title={t.theme.evidence}>
            <div className="evidence-grid">
              {theme.evidence.map((item) => (
                <div key={item.label} className="evidence-item">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </ThemeBlock>
        )}
        {theme.shareholders && theme.shareholders.length > 0 && (
          <ThemeBlock title={t.theme.shareholders}>
            <ul className="plain-list">
              {theme.shareholders.map((holder) => (
                <li key={holder.name}>
                  <strong>{holder.name}</strong>
                  <small>
                    {holder.percentage}%
                    {holder.birth_year && ` · ${holder.birth_year}`}
                  </small>
                </li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.administrators && theme.administrators.length > 0 && (
          <ThemeBlock title={t.theme.administrators}>
            <ul className="plain-list">
              {theme.administrators.map((admin) => (
                <li key={admin.name}>
                  <strong>{admin.name}</strong>
                  <small>
                    {admin.role}
                    {admin.appointment_date && ` · ${admin.appointment_date}`}
                  </small>
                </li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.credit_relevance && (
          <ThemeBlock title={t.theme.creditRelevance}>
            <p>{theme.credit_relevance}</p>
          </ThemeBlock>
        )}
        {theme.risks && theme.risks.length > 0 && (
          <ThemeBlock title={t.theme.risks}>
            <ul className="plain-list">
              {theme.risks.map((risk) => (
                <li key={risk.hazard}>
                  <strong>{risk.hazard}</strong>
                  <small>{risk.description}</small>
                </li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.opportunities && theme.opportunities.length > 0 && (
          <ThemeBlock title={t.theme.opportunities}>
            <ul className="plain-list">
              {theme.opportunities.map((opportunity) => (
                <li key={opportunity.lever}>
                  <strong>{opportunity.lever}</strong>
                  <small>{opportunity.description}</small>
                </li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.recommendations && theme.recommendations.length > 0 && (
          <ThemeBlock title={t.theme.recommendations}>
            <ul className="plain-list">
              {theme.recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <strong>{recommendation.action}</strong>
                  <small>
                    {recommendation.priority} · {recommendation.horizon}
                  </small>
                </li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.kpis && theme.kpis.length > 0 && (
          <ThemeBlock title={t.theme.kpis}>
            <ul className="bullet-list">
              {theme.kpis.map((kpi) => (
                <li key={kpi}>{kpi}</li>
              ))}
            </ul>
          </ThemeBlock>
        )}
        {theme.meeting_questions && theme.meeting_questions.length > 0 && (
          <ThemeBlock title={t.theme.meetingQuestions}>
            <ol className="bullet-list">
              {theme.meeting_questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </ThemeBlock>
        )}
      </div>
    </article>
  );
}

function ThemeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="theme-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="content-panel report-panel">
      <div className="panel-heading-row">
        <h2>{title}</h2>
        {aside}
      </div>
      <div className="report-panel-body">{children}</div>
    </section>
  );
}

// Shows only the fields that have a label, so raw numbers and nested data stay hidden.
function KeyValuePanel({
  title,
  data,
  labels,
  columns = 2,
}: {
  title: string;
  data?: object;
  labels: Record<string, string>;
  columns?: 2 | 3;
}) {
  const entries = Object.entries(data ?? {}).filter(
    ([key, value]) =>
      key in labels && value != null && value !== "" && typeof value !== "object",
  );
  if (entries.length === 0) return null;

  return (
    <Panel title={title}>
      <dl className={`kv-grid kv-grid-${columns}`}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt>{labels[key]}</dt>
            <dd>{typeof value === "number" ? value.toLocaleString("it-IT") : String(value)}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function EmptyTab({ t }: { t: Messages }) {
  return (
    <div className="content-panel report-empty">
      <Inbox size={28} />
      <strong>{t.empty.title}</strong>
      <span>{t.empty.text}</span>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
