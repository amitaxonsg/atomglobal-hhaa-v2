import React from "react";
import { api, isMockMode } from "../../api/client";
import { BrandLogo, useBranding } from "../../branding/BrandContext";
import { Spinner, Notice } from "./AdminShared";
import { AssessmentsPage, BrandingPage, ContentPage, DashboardPage, ParticipantsPage } from "./AdminCorePages";
import { AffiliatesPage, AnalyticsPage, AuditPage, EmailPage, PaymentsPage, ReportsPage, SeoPage, SettingsPage } from "./AdminOperationsPages";

const sections = [
  "Dashboard",
  "Participants",
  "Assessments",
  "Content",
  "Branding",
  "Reports",
  "Payments",
  "Email",
  "Affiliates",
  "Analytics",
  "SEO",
  "Settings",
  "Audit",
];

function AdminLogin({ onLogin }) {
  const [form, setForm] = React.useState({ email: isMockMode ? "preview@atomglobal.com" : "", password: isMockMode ? "preview-only" : "" });
  const [state, setState] = React.useState({ busy: false, error: "" });
  const submit = async event => {
    event.preventDefault();
    setState({ busy: true, error: "" });
    try {
      const result = await api.adminLogin(form);
      onLogin(result.user);
      setState({ busy: false, error: "" });
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };

  return <main className="admin-login"><form className="admin-login__card" onSubmit={submit}>
    <BrandLogo />
    <p className="eyebrow">Head–Heart Alignment</p>
    <h1>Administration</h1>
    <Notice type="error">{state.error}</Notice>
    <label>Email<input type="email" autoComplete="username" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required /></label>
    <label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required /></label>
    <button className="button button--primary" disabled={state.busy}>{state.busy ? "Signing in…" : isMockMode ? "Enter preview CMS" : "Sign in"}</button>
    {isMockMode && <p className="hint">Preview mode uses representative data. Production uses secure PHP sessions, CSRF protection, rate limits and role permissions.</p>}
  </form></main>;
}

const pages = {
  Dashboard: DashboardPage,
  Participants: ParticipantsPage,
  Assessments: AssessmentsPage,
  Content: ContentPage,
  Branding: BrandingPage,
  Reports: ReportsPage,
  Payments: PaymentsPage,
  Email: EmailPage,
  Affiliates: AffiliatesPage,
  Analytics: AnalyticsPage,
  SEO: SeoPage,
  Settings: SettingsPage,
  Audit: AuditPage,
};

export default function AdminApp() {
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);
  const [active, setActive] = React.useState("Dashboard");
  const { branding } = useBranding();

  React.useEffect(() => {
    api.adminSession().then(result => setUser(result.user)).catch(() => {}).finally(() => setChecking(false));
  }, []);

  if (checking) return <Spinner />;
  if (!user) return <AdminLogin onLogin={setUser} />;

  const logout = () => api.adminLogout().finally(() => setUser(null));
  const ActivePage = pages[active] || DashboardPage;

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/" className="admin-brand"><BrandLogo /><span>Assessment CMS</span></a>
      <nav>{sections.map(section => <button className={section === active ? "active" : ""} onClick={() => setActive(section)} key={section}>{section}</button>)}</nav>
      <div className="admin-user"><i>{user.displayName?.split(" ").map(part => part[0]).join("").slice(0, 2) || "AG"}</i><span>{user.displayName}<small>{user.roleName}</small></span><button onClick={logout}>Sign out</button></div>
    </aside>
    <main className="admin-main" style={{ "--admin-logo": `url(${branding.logoUrl})` }}><ActivePage /></main>
  </div>;
}
