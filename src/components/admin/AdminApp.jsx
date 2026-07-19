import React from "react";
import { api, isMockMode } from "../../api/client";
import { BrandLogo, defaultConfiguration, useBranding } from "../../branding/BrandContext";

const sections = ["Dashboard", "Participants", "Assessments", "Content", "Branding", "Reports", "Payments", "Email", "Affiliates", "SEO", "Settings", "Audit"];
const inputValue = event => event.target.type === "checkbox" ? event.target.checked : event.target.value;
const money = (minor, currency = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor || 0) / 100);
const dateTime = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

function Notice({ type = "info", children }) { return children ? <p className={`admin-notice admin-notice--${type}`}>{children}</p> : null; }
function Spinner() { return <div className="admin-spinner" role="status">Loading…</div>; }
function Empty({ children = "No records found." }) { return <div className="admin-empty">{children}</div>; }
function PageHeader({ eyebrow = "Administration", title, actions }) { return <header className="admin-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="admin-header-actions">{actions}</div></header>; }

function useLoader(loader, dependencies = []) {
  const [state, setState] = React.useState({ loading: true, data: null, error: "" });
  const refresh = React.useCallback(() => {
    setState(current => ({ ...current, loading: true, error: "" }));
    return loader().then(data => { setState({ loading: false, data, error: "" }); return data; }).catch(error => { setState({ loading: false, data: null, error: error.message }); throw error; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  React.useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  return { ...state, refresh, setData: data => setState({ loading: false, data, error: "" }) };
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = React.useState({ email: isMockMode ? "preview@atomglobal.com" : "", password: isMockMode ? "preview-only" : "" });
  const [state, setState] = React.useState({ busy: false, error: "" });
  const submit = async event => {
    event.preventDefault(); setState({ busy: true, error: "" });
    try { const result = await api.adminLogin(form); onLogin(result.user); }
    catch (error) { setState({ busy: false, error: error.message }); return; }
    setState({ busy: false, error: "" });
  };
  return <main className="admin-login"><form className="admin-login__card" onSubmit={submit}>
    <BrandLogo /><p className="eyebrow">Head–Heart Alignment</p><h1>Administration</h1>
    <Notice type="error">{state.error}</Notice>
    <label>Email<input type="email" autoComplete="username" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required /></label>
    <label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required /></label>
    <button className="button button--primary" disabled={state.busy}>{state.busy ? "Signing in…" : isMockMode ? "Enter preview CMS" : "Sign in"}</button>
    {isMockMode && <p className="hint">Preview mode uses representative data only. Production uses secure PHP sessions, CSRF protection, rate limits and role permissions.</p>}
  </form></main>;
}

function Dashboard() {
  const { loading, data, error, refresh } = useLoader(() => api.adminDashboard(), []);
  if (loading) return <Spinner />;
  return <><PageHeader eyebrow={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())} title="Dashboard" actions={<button className="button" onClick={refresh}>Refresh</button>} /><Notice type="error">{error}</Notice>
    <section className="metric-grid">{(data?.metrics || []).map(metric => <article className="metric" key={metric.label}><span>{metric.label}</span><strong>{metric.label === "Revenue" ? money(metric.value) : metric.value}</strong></article>)}</section>
    <div className="admin-grid"><section className="admin-card"><div className="card-heading"><h2>Recent participants</h2></div><DataTable columns={["Participant", "Assessment", "Progress", "Payment", "Last activity"]} rows={(data?.participants || []).map(row => [<><strong>{row.name}</strong><span>{row.email}</span></>, row.track, `${row.progress}%`, row.payment || row.paymentStatus || "Free", dateTime(row.activity || row.lastActivityAt)])} /></section>
      <aside className="admin-card"><div className="card-heading"><h2>System attention</h2></div><dl className="admin-definition"><div><dt>Failed emails</dt><dd>{data?.failures?.failedEmails || 0}</dd></div><div><dt>Failed webhooks</dt><dd>{data?.failures?.failedWebhooks || 0}</dd></div><div><dt>Critical alerts</dt><dd>{data?.failures?.criticalAlerts || 0}</dd></div></dl><div className="card-heading"><h2>Recent activity</h2></div><ol className="activity-list">{(data?.activity || []).map((item, index) => <li key={`${item.action || item}-${index}`}><i>{index + 1}</i><span>{item.action || item}<small>{dateTime(item.createdAt)}</small></span></li>)}</ol></aside>
    </div></>;
}

function DataTable({ columns, rows, onRow }) {
  if (!rows.length) return <Empty />;
  return <div className="table-wrap"><table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((cells, index) => <tr key={index} onClick={onRow ? () => onRow(index) : undefined} className={onRow ? "is-clickable" : ""}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Participants() {
  const [query, setQuery] = React.useState({ search: "", status: "", track: "", page: 1, limit: 25 });
  const [selected, setSelected] = React.useState(null);
  const [notice, setNotice] = React.useState("");
  const loader = useLoader(() => api.adminParticipants(query), [query.search, query.status, query.track, query.page]);
  const open = item => api.adminParticipant(item.id).then(setSelected).catch(error => setNotice(error.message));
  const exportRecord = () => api.exportParticipant(selected.participant.id).then(data => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `participant-${selected.participant.id}.json`; link.click(); URL.revokeObjectURL(link.href); });
  const anonymise = async () => { if (!confirm("Anonymise this participant and remove direct personal identifiers?")) return; await api.anonymiseParticipant(selected.participant.id); setSelected(null); loader.refresh(); };
  return <><PageHeader title="Participants" actions={<button className="button" onClick={loader.refresh}>Refresh</button>} /><Notice type="error">{loader.error || notice}</Notice>
    <div className="admin-filters"><input placeholder="Search name or email" value={query.search} onChange={event => setQuery(current => ({ ...current, search: event.target.value, page: 1 }))} /><select value={query.status} onChange={event => setQuery(current => ({ ...current, status: event.target.value, page: 1 }))}><option value="">All statuses</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="expired">Expired</option></select><select value={query.track} onChange={event => setQuery(current => ({ ...current, track: event.target.value, page: 1 }))}><option value="">All tracks</option><option value="personal">Personal</option><option value="newjoiner">New Joiner</option><option value="manager">Manager</option><option value="executive">Executive</option></select></div>
    {loader.loading ? <Spinner /> : <section className="admin-card"><DataTable columns={["Participant", "Track", "Status", "Progress", "Payment", "Last activity"]} rows={(loader.data?.items || []).map(item => [<><strong>{item.name}</strong><span>{item.email}</span></>, item.track, item.status, `${item.progress || 0}%`, item.paymentStatus || "—", dateTime(item.lastActivityAt)])} onRow={index => open(loader.data.items[index])} /><div className="admin-pagination"><button className="button" disabled={query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))}>Previous</button><span>Page {query.page} · {loader.data?.total || 0} records</span><button className="button" disabled={query.page * query.limit >= (loader.data?.total || 0)} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>Next</button></div></section>}
    {selected && <div className="admin-drawer"><div className="admin-drawer__panel"><button className="admin-drawer__close" onClick={() => setSelected(null)}>×</button><h2>{selected.participant.name}</h2><p>{selected.participant.email}</p><div className="admin-header-actions"><button className="button" onClick={exportRecord}>Export</button><button className="button button--danger" onClick={anonymise}>Anonymise</button></div><h3>Assessments</h3><DataTable columns={["Track", "Status", "Progress", "Completed"]} rows={(selected.sessions || []).map(item => [item.track, item.status, `${item.completion_percentage}%`, dateTime(item.completed_at)])} /><h3>Payments</h3><DataTable columns={["Status", "Amount", "Date"]} rows={(selected.payments || []).map(item => [item.status, money(item.amount, item.currency), dateTime(item.created_at)])} /><h3>Email history</h3><DataTable columns={["Template", "Status", "Date"]} rows={(selected.emails || []).map(item => [item.template_key, item.status, dateTime(item.created_at)])} /></div></div>}
  </>;
}

function Assessments() {
  const loader = useLoader(() => api.adminAssessments(), []);
  const [notice, setNotice] = React.useState("");
  const clone = async item => { const versionNumber = prompt("New version number", "1.1.0"); if (!versionNumber) return; const changeSummary = prompt("Change summary", "Draft copy for review") || "Draft copy"; await api.cloneAssessment(item.versionId, { versionNumber, changeSummary }); setNotice("Draft version created."); loader.refresh(); };
  const publish = async item => { if (!confirm(`Publish ${item.trackName} ${item.versionNumber}? The prior published version will be archived.`)) return; try { await api.publishAssessment(item.versionId); setNotice("Assessment version published."); loader.refresh(); } catch (error) { setNotice(error.message); } };
  return <><PageHeader title="Assessments" actions={<button className="button" onClick={loader.refresh}>Refresh</button>} /><Notice>{notice}</Notice><Notice type="error">{loader.error}</Notice>{loader.loading ? <Spinner /> : <section className="admin-card"><DataTable columns={["Track", "Version", "Status", "Questions", "Sections", "Actions"]} rows={(loader.data?.items || []).map(item => [item.trackName, item.versionNumber, <span className={`status status--${item.status}`}>{item.status}</span>, item.questionCount, item.sectionCount, <div className="table-actions"><button onClick={event => { event.stopPropagation(); clone(item); }}>Clone</button>{item.status === "draft" && <button onClick={event => { event.stopPropagation(); publish(item); }}>Publish</button>}</div>])} /></section>}</>;
}

function ContentManager() {
  const loader = useLoader(() => api.adminContent(), []);
  const [selected, setSelected] = React.useState("version");
  const [content, setContent] = React.useState({});
  const [notice, setNotice] = React.useState("");
  React.useEffect(() => { if (loader.data?.items) setContent(loader.data.items); }, [loader.data]);
  const item = content[selected];
  const update = (key, value) => setContent(current => ({ ...current, [selected]: { ...current[selected], [key]: value } }));
  const upload = async event => { const file = event.target.files?.[0]; if (!file) return; const media = await api.uploadMedia(file, { altText: item.alt || "", focalX: 52, focalY: 50 }); update("image", media.url); update("desktopMediaId", media.id); setNotice("Image uploaded. Save the stage to publish the reference."); };
  const save = async () => { const focal = String(item.focalPoint || "50% 50%").split(" ").map(value => Number.parseFloat(value)); await api.saveContentStage(selected, { ...item, focalX: focal[0] || 50, focalY: focal[1] || 50 }); setNotice("Stage content saved."); };
  if (loader.loading || !item) return <Spinner />;
  return <><PageHeader eyebrow="Experience" title="Stage content" actions={<button className="button button--primary" onClick={save}>Save stage</button>} /><Notice>{notice}</Notice><Notice type="error">{loader.error}</Notice><div className="content-editor"><aside className="stage-list">{Object.entries(content).map(([key, stage]) => <button className={key === selected ? "active" : ""} key={key} onClick={() => setSelected(key)}><img src={stage.image} alt="" /><span>{key.replaceAll("-", " ")}<small>{stage.active ? "Active" : "Inactive"}</small></span></button>)}</aside><section className="admin-card editor-form"><div className="editor-preview" style={{ backgroundImage: `linear-gradient(rgba(24,20,15,.${item.overlay}),rgba(24,20,15,.${item.overlay})),url(${item.image})`, backgroundPosition: item.focalPoint }}><BrandLogo /><h2>{item.headline}</h2><p>{item.supporting}</p></div><div className="form-grid"><label>Desktop image<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" onChange={upload} /></label><label>Headline<textarea value={item.headline || ""} onChange={event => update("headline", event.target.value)} /></label><label>Supporting text<textarea value={item.supporting || ""} onChange={event => update("supporting", event.target.value)} /></label><label>Image alt text<input value={item.alt || ""} onChange={event => update("alt", event.target.value)} /></label><label>Focal point<select value={item.focalPoint || "50% 50%"} onChange={event => update("focalPoint", event.target.value)}><option>40% 50%</option><option>50% 50%</option><option>52% 50%</option><option>60% 50%</option></select></label><label>Overlay strength <output>{item.overlay}%</output><input type="range" min="20" max="85" value={item.overlay || 40} onChange={event => update("overlay", Number(event.target.value))} /></label><label className="check-row"><input type="checkbox" checked={Boolean(item.active)} onChange={event => update("active", event.target.checked)} /> Active stage</label></div></section></div></>;
}

const brandFields = [
  ["canvas", "Canvas colour", "color"], ["surface", "Surface colour", "color"], ["textPrimary", "Primary text", "color"], ["textMuted", "Muted text", "color"], ["border", "Border colour", "color"], ["cta", "Primary CTA", "color"], ["ctaHover", "CTA hover", "color"], ["heart", "Heart colour", "color"], ["head", "Head colour", "color"], ["accent", "Accent / gold", "color"], ["navy", "Admin navy", "color"], ["headingFont", "Heading font", "text"], ["bodyFont", "Body font", "text"], ["baseFontSize", "Base font size", "number"], ["cardRadius", "Card radius", "number"], ["buttonRadius", "Button radius", "number"],
];

function BrandingManager() {
  const loader = useLoader(() => api.adminBranding(), []);
  const [draft, setDraft] = React.useState(null);
  const [draftId, setDraftId] = React.useState(null);
  const [notice, setNotice] = React.useState("");
  React.useEffect(() => { if (loader.data) { setDraft(loader.data.draft || loader.data.published); setDraftId(loader.data.draftId); } }, [loader.data]);
  if (loader.loading || !draft) return <Spinner />;
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const uploadAsset = key => async event => { const file = event.target.files?.[0]; if (!file) return; const media = await api.uploadMedia(file, { altText: key.includes("logo") ? "Atom Global Consulting" : "Head–Heart Alignment banner" }); update(key, media.url); setNotice("Asset uploaded. Save and publish the branding draft to activate it."); };
  const save = async () => { const result = await api.saveBrandingDraft(draft); setDraftId(result.draftId); setNotice("Branding draft saved."); };
  const publish = async () => { const id = draftId || (await api.saveBrandingDraft(draft)).draftId; await api.publishBranding(id); setNotice("Branding published. Public configuration will use the new values."); loader.refresh(); };
  const restore = () => { setDraft({ ...defaultConfiguration.branding }); setNotice("Defaults restored in the editor. Save to keep as a draft or publish to activate."); };
  return <><PageHeader title="Branding" actions={<><button className="button" onClick={restore}>Restore defaults</button><button className="button" onClick={save}>Save draft</button><button className="button button--primary" onClick={publish}>Publish</button></>} /><Notice>{notice}</Notice><Notice type="error">{loader.error}</Notice><div className="branding-layout"><section className="admin-card editor-form"><h2>Theme system</h2><div className="form-grid">{brandFields.map(([key, label, type]) => <label key={key}>{label}<input type={type} value={draft[key] ?? ""} onChange={event => update(key, inputValue(event))} /></label>)}</div><h2>Brand assets</h2><div className="form-grid"><label>Public logo<input type="file" accept="image/*" onChange={uploadAsset("logoUrl")} /><small>{draft.logoUrl}</small></label><label>Banner image<input type="file" accept="image/*" onChange={uploadAsset("bannerUrl")} /><small>{draft.bannerUrl || "Not set"}</small></label><label>Email logo<input type="file" accept="image/*" onChange={uploadAsset("emailLogoUrl")} /><small>{draft.emailLogoUrl}</small></label><label>Report logo<input type="file" accept="image/*" onChange={uploadAsset("reportLogoUrl")} /><small>{draft.reportLogoUrl}</small></label><label>Favicon<input type="file" accept="image/png,image/svg+xml,image/x-icon" onChange={uploadAsset("faviconUrl")} /><small>{draft.faviconUrl}</small></label></div></section><aside className="branding-preview" style={{ "--preview-canvas": draft.canvas, "--preview-surface": draft.surface, "--preview-ink": draft.textPrimary, "--preview-muted": draft.textMuted, "--preview-border": draft.border, "--preview-cta": draft.cta, "--preview-heading": draft.headingFont, "--preview-body": draft.bodyFont }}><img src={draft.logoUrl} alt="Atom Global Consulting" /><p>HEAD–HEART ALIGNMENT · LIVE PREVIEW</p><h2>Pause. Reflect. Choose wisely.</h2><span>Calm, reflective and consistent across participant, admin, email and report experiences.</span><button>Continue</button></aside></div></>;
}

function Reports() {
  const loader = useLoader(() => api.adminReports(), []); const [notice, setNotice] = React.useState("");
  const action = async (item, name) => { if (["revoke", "lock"].includes(name) && !confirm(`${name} this report?`)) return; await api.reportAction(item.id, name); setNotice(`Report ${name} action completed.`); loader.refresh(); };
  return <><PageHeader title="Reports" actions={<button className="button" onClick={loader.refresh}>Refresh</button>} /><Notice>{notice}</Notice>{loader.loading ? <Spinner /> : <section className="admin-card"><DataTable columns={["Participant", "Track", "Status", "Expires", "Views", "Actions"]} rows={(loader.data?.items || []).map(item => [<><strong>{item.participantName}</strong><span>{item.participantEmail}</span></>, item.track, item.revokedAt ? "Revoked" : item.unlocked ? "Full report" : "Lite report", dateTime(item.tokenExpiresAt), item.viewCount, <div className="table-actions"><button onClick={() => action(item, item.unlocked ? "lock" : "unlock")}>{item.unlocked ? "Lock" : "Unlock"}</button><button onClick={() => action(item, "resend")}>Resend</button><button onClick={() => action(item, "revoke")}>Revoke</button></div>])} /></section>}</>;
}

function Payments() {
  const loader = useLoader(() => api.adminPayments(), []);
  return <><PageHeader title="Payments" actions={<button className="button" onClick={loader.refresh}>Refresh</button>} />{loader.loading ? <Spinner /> : <section className="admin-card"><DataTable columns={["Participant", "Track", "Status", "Amount", "Provider", "Affiliate", "Date"]} rows={(loader.data?.items || []).map(item => [<><strong>{item.participantName}</strong><span>{item.participantEmail}</span></>, item.track, <span className={`status status--${item.status}`}>{item.status}</span>, money(item.amount, item.currency), item.provider, item.affiliateCode || "—", dateTime(item.created_at)])} /></section>}</>;
}

function EmailManager() {
  const templates = useLoader(() => api.adminEmailTemplates(), []);
  const queue = useLoader(() => api.adminEmailQueue(), []);
  const [selected, setSelected] = React.useState(null); const [testRecipient, setTestRecipient] = React.useState(""); const [notice, setNotice] = React.useState("");
  React.useEffect(() => { if (!selected && templates.data?.items?.length) setSelected({ ...templates.data.items[0] }); }, [templates.data, selected]);
  const save = async () => { await api.saveEmailTemplate(selected.template_key, { templateName: selected.template_name, subject: selected.subject, htmlBody: selected.html_body, textBody: selected.text_body, active: Boolean(selected.is_active) }); setNotice("Email template saved."); templates.refresh(); };
  const sendTest = async () => { await api.testEmail(testRecipient); setNotice("Test email queued. Run the email worker and inspect delivery status."); queue.refresh(); };
  return <><PageHeader title="Email" actions={<button className="button" onClick={() => { templates.refresh(); queue.refresh(); }}>Refresh</button>} /><Notice>{notice}</Notice><div className="admin-grid admin-grid--email"><section className="admin-card"><div className="card-heading"><h2>Templates</h2></div><div className="admin-list">{(templates.data?.items || []).map(item => <button className={selected?.template_key === item.template_key ? "active" : ""} onClick={() => setSelected({ ...item })} key={item.template_key}>{item.template_name}<small>{item.is_active ? "Active" : "Inactive"}</small></button>)}</div></section><section className="admin-card editor-form">{selected ? <><div className="card-heading"><h2>{selected.template_name}</h2><button onClick={save}>Save</button></div><label>Template name<input value={selected.template_name} onChange={event => setSelected(current => ({ ...current, template_name: event.target.value }))} /></label><label>Subject<input value={selected.subject} onChange={event => setSelected(current => ({ ...current, subject: event.target.value }))} /></label><label>HTML body<textarea rows="10" value={selected.html_body} onChange={event => setSelected(current => ({ ...current, html_body: event.target.value }))} /></label><label>Text body<textarea rows="8" value={selected.text_body} onChange={event => setSelected(current => ({ ...current, text_body: event.target.value }))} /></label><label className="check-row"><input type="checkbox" checked={Boolean(selected.is_active)} onChange={event => setSelected(current => ({ ...current, is_active: event.target.checked ? 1 : 0 }))} /> Active template</label></> : <Empty />}</section></div><section className="admin-card"><div className="card-heading"><h2>Test and delivery queue</h2><div className="inline-form"><input type="email" placeholder="admin@example.com" value={testRecipient} onChange={event => setTestRecipient(event.target.value)} /><button className="button" disabled={!testRecipient} onClick={sendTest}>Send test email</button></div></div><DataTable columns={["Recipient", "Template", "Status", "Attempts", "Scheduled", "Action"]} rows={(queue.data?.items || []).map(item => [item.recipient_email, item.template_key, item.status, `${item.attempts}/${item.max_attempts}`, dateTime(item.scheduled_at), item.status === "failed" ? <button onClick={() => api.retryEmail(item.id).then(queue.refresh)}>Retry</button> : "—"])} /></section></>;
}

function Affiliates() {
  const loader = useLoader(() => api.adminAffiliates(), []); const [form, setForm] = React.useState({ code: "", name: "", contactName: "", contactEmail: "", campaignName: "", cookieDurationDays: 30, commissionType: "percentage", commissionValue: 0, tracks: ["personal", "newjoiner", "manager", "executive"], notes: "", active: true }); const [notice, setNotice] = React.useState("");
  const save = async () => { await api.saveAffiliate(form); setNotice("Affiliate saved."); loader.refresh(); };
  return <><PageHeader title="Affiliates" /><Notice>{notice}</Notice><div className="admin-grid"><section className="admin-card"><DataTable columns={["Code", "Name", "Clicks", "Conversions", "Revenue", "Commission", "Status"]} rows={(loader.data?.items || []).map(item => [item.affiliate_code, item.name, item.clicks, item.conversions, money(item.revenueMinor), money(item.commissionMinor), item.is_active ? "Active" : "Inactive"])} /></section><aside className="admin-card editor-form"><h2>Create affiliate</h2><label>Code<input value={form.code} onChange={event => setForm(current => ({ ...current, code: event.target.value }))} /></label><label>Name<input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></label><label>Contact email<input type="email" value={form.contactEmail} onChange={event => setForm(current => ({ ...current, contactEmail: event.target.value }))} /></label><label>Campaign<input value={form.campaignName} onChange={event => setForm(current => ({ ...current, campaignName: event.target.value }))} /></label><label>Cookie duration days<input type="number" value={form.cookieDurationDays} onChange={event => setForm(current => ({ ...current, cookieDurationDays: Number(event.target.value) }))} /></label><label>Commission type<select value={form.commissionType} onChange={event => setForm(current => ({ ...current, commissionType: event.target.value }))}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></label><label>Commission value<input type="number" step="0.01" value={form.commissionValue} onChange={event => setForm(current => ({ ...current, commissionValue: Number(event.target.value) }))} /></label><button className="button button--primary" onClick={save}>Save affiliate</button></aside></div></>;
}

function SeoManager() {
  const loader = useLoader(() => api.adminSeoPages(), []); const [form, setForm] = React.useState({ pageKey: "home", path: "/", pageTitle: "Head–Heart Alignment | Atom Global Consulting", metaDescription: "A reflective assessment balancing reason and human insight.", canonicalUrl: "https://head-heart.atomglobal.com/", robotsSetting: "index,follow", ogTitle: "Head–Heart Alignment", ogDescription: "Pause. Reflect. Choose wisely.", heading: "Head–Heart Alignment", introductoryContent: "", faq: [], structuredData: {}, includeInSitemap: true }); const [notice, setNotice] = React.useState("");
  React.useEffect(() => { const item = loader.data?.items?.[0]; if (item) setForm(current => ({ ...current, pageKey: item.page_key, path: item.path, pageTitle: item.page_title || "", metaDescription: item.meta_description || "", canonicalUrl: item.canonical_url || "", robotsSetting: item.robots_setting || "index,follow", ogTitle: item.og_title || "", ogDescription: item.og_description || "", heading: item.heading || "", introductoryContent: item.introductory_content || "", includeInSitemap: Boolean(item.include_in_sitemap) })); }, [loader.data]);
  const save = async () => { await api.saveSeoPage(form.pageKey, form); setNotice("SEO/AEO/GEO settings saved."); loader.refresh(); };
  return <><PageHeader title="SEO / AEO / GEO" actions={<button className="button button--primary" onClick={save}>Save page settings</button>} /><Notice>{notice}</Notice><section className="admin-card editor-form"><div className="form-grid"><label>Page key<input value={form.pageKey} onChange={event => setForm(current => ({ ...current, pageKey: event.target.value }))} /></label><label>Path<input value={form.path} onChange={event => setForm(current => ({ ...current, path: event.target.value }))} /></label><label>Page title<input value={form.pageTitle} onChange={event => setForm(current => ({ ...current, pageTitle: event.target.value }))} /></label><label>Canonical URL<input value={form.canonicalUrl} onChange={event => setForm(current => ({ ...current, canonicalUrl: event.target.value }))} /></label><label className="form-grid__wide">Meta description<textarea value={form.metaDescription} onChange={event => setForm(current => ({ ...current, metaDescription: event.target.value }))} /></label><label>Robots<select value={form.robotsSetting} onChange={event => setForm(current => ({ ...current, robotsSetting: event.target.value }))}><option>index,follow</option><option>noindex,nofollow</option></select></label><label>Open Graph title<input value={form.ogTitle} onChange={event => setForm(current => ({ ...current, ogTitle: event.target.value }))} /></label><label className="form-grid__wide">Open Graph description<textarea value={form.ogDescription} onChange={event => setForm(current => ({ ...current, ogDescription: event.target.value }))} /></label><label className="check-row"><input type="checkbox" checked={form.includeInSitemap} onChange={event => setForm(current => ({ ...current, includeInSitemap: event.target.checked }))} /> Include in sitemap</label></div></section></>;
}

const settingsGroups = {
  email: ["provider", "adminFromName", "adminFromAddress", "replyTo", "smtpHost", "smtpPort", "smtpUsername", "smtpPassword", "smtpEncryption", "smtp2goApiKey", "reminderHours", "maxAttempts"],
  stripe: ["mode", "publishableKey", "secretKey", "webhookSecret", "pricePersonal", "priceNewjoiner", "priceManager", "priceExecutive"],
  alerts: ["types"],
  security: ["sessionLifetime", "reportTokenDays", "resumeTokenHours", "loginLimit", "loginWindowSeconds"],
  privacy: ["analyticsDefault", "incompleteRetentionDays", "completedRetentionDays"],
  turnstile: ["siteKey", "secretKey"],
};

function SettingsManager() {
  const [group, setGroup] = React.useState("email"); const loader = useLoader(() => api.adminSettings(), []); const alerts = useLoader(() => api.adminAlertRecipients(), []); const [values, setValues] = React.useState({}); const [notice, setNotice] = React.useState(""); const [alertForm, setAlertForm] = React.useState({ name: "", email: "", alertTypes: ["email_failed", "payment_failed", "webhook_failed"], active: true });
  React.useEffect(() => { if (loader.data) setValues(loader.data); }, [loader.data]);
  const groupValues = values[group] || {};
  const save = async () => { await api.saveSettings(group, groupValues); setNotice(`${group} settings saved. Sensitive values are encrypted in the database or stored only in the external environment file.`); loader.refresh(); };
  const addAlert = async () => { await api.saveAlertRecipient(alertForm); setNotice("Admin alert recipient saved."); alerts.refresh(); };
  return <><PageHeader title="Settings" actions={<button className="button button--primary" onClick={save}>Save {group}</button>} /><Notice>{notice}</Notice><div className="settings-tabs">{Object.keys(settingsGroups).map(key => <button className={group === key ? "active" : ""} onClick={() => setGroup(key)} key={key}>{key}</button>)}</div><div className="admin-grid"><section className="admin-card editor-form"><h2>{group[0].toUpperCase() + group.slice(1)} configuration</h2><div className="form-grid">{settingsGroups[group].map(key => { const current = groupValues[key]; const sensitive = ["smtpPassword", "smtp2goApiKey", "secretKey", "webhookSecret"].includes(key); return <label key={key}>{key.replace(/([A-Z])/g, " $1")}<input type={sensitive ? "password" : key.toLowerCase().includes("port") || key.toLowerCase().includes("days") || key.toLowerCase().includes("lifetime") || key.toLowerCase().includes("limit") ? "number" : "text"} placeholder={current?.masked || ""} value={typeof current === "object" ? "" : current ?? ""} onChange={event => setValues(all => ({ ...all, [group]: { ...(all[group] || {}), [key]: event.target.value } }))} /></label>; })}</div><p className="hint">Use Stripe test mode and SMTP2GO test delivery until staging acceptance. Secret values are never returned to the browser after saving.</p></section><aside className="admin-card editor-form"><h2>Admin alerts</h2><label>Name<input value={alertForm.name} onChange={event => setAlertForm(current => ({ ...current, name: event.target.value }))} /></label><label>Email<input type="email" value={alertForm.email} onChange={event => setAlertForm(current => ({ ...current, email: event.target.value }))} /></label><button className="button" onClick={addAlert}>Add alert recipient</button><div className="admin-list">{(alerts.data?.items || []).map(item => <div key={item.id}><strong>{item.name}</strong><small>{item.email}</small></div>)}</div><h2>Environment status</h2><dl className="admin-definition">{Object.entries(values.environment || {}).map(([key, configured]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{configured ? "Configured" : "Missing"}</dd></div>)}</dl></aside></div></>;
}

function Audit() {
  const loader = useLoader(() => api.adminAuditLogs({ limit: 300 }), []);
  return <><PageHeader title="Audit log" actions={<button className="button" onClick={loader.refresh}>Refresh</button>} />{loader.loading ? <Spinner /> : <section className="admin-card"><DataTable columns={["Date", "Administrator", "Action", "Entity", "ID"]} rows={(loader.data?.items || []).map(item => [dateTime(item.created_at), item.adminName || "System", item.action, item.entity_type || "—", item.entity_id || "—"])} /></section>}</>;
}

export default function AdminApp() {
  const [user, setUser] = React.useState(null); const [checking, setChecking] = React.useState(true); const [active, setActive] = React.useState("Dashboard"); const { branding } = useBranding();
  React.useEffect(() => { api.adminSession().then(result => setUser(result.user)).catch(() => {}).finally(() => setChecking(false)); }, []);
  if (checking) return <Spinner />;
  if (!user) return <AdminLogin onLogin={setUser} />;
  const logout = () => api.adminLogout().finally(() => setUser(null));
  const page = { Dashboard: <Dashboard />, Participants: <Participants />, Assessments: <Assessments />, Content: <ContentManager />, Branding: <BrandingManager />, Reports: <Reports />, Payments: <Payments />, Email: <EmailManager />, Affiliates: <Affiliates />, SEO: <SeoManager />, Settings: <SettingsManager />, Audit: <Audit /> }[active];
  return <div className="admin-shell"><aside className="admin-sidebar"><a href="/" className="admin-brand"><BrandLogo /><span>Assessment CMS</span></a><nav>{sections.map(section => <button className={section === active ? "active" : ""} onClick={() => setActive(section)} key={section}>{section}</button>)}</nav><div className="admin-user"><i>{user.displayName?.split(" ").map(part => part[0]).join("").slice(0, 2) || "AG"}</i><span>{user.displayName}<small>{user.roleName}</small></span><button onClick={logout}>Sign out</button></div></aside><main className="admin-main" style={{ "--admin-logo": `url(${branding.logoUrl})` }}>{page}</main></div>;
}
