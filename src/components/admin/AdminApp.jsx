import React from "react";
import { api, isMockMode } from "../../api/client";
import { BrandLogo, useBranding } from "../../branding/BrandContext";
import { Spinner, Notice } from "./AdminShared";
import { AssessmentsPage, BrandingPage, ContentPage, DashboardPage, ParticipantsPage } from "./AdminCorePages";
import { AffiliatesPage, AnalyticsPage, AuditPage, EmailPage, PaymentsPage, ReportsPage, SeoPage, SettingsPage } from "./AdminOperationsPages";

const sections = [
  { label: "Dashboard", group: "Overview" },
  { label: "Participants", group: "Assessment" },
  { label: "Assessments", group: "Assessment" },
  { label: "Content", group: "Experience" },
  { label: "Branding", group: "Experience" },
  { label: "Reports", group: "Operations" },
  { label: "Payments", group: "Operations" },
  { label: "Email", group: "Operations" },
  { label: "Affiliates", group: "Growth" },
  { label: "Analytics", group: "Growth" },
  { label: "SEO", group: "Growth" },
  { label: "Settings", group: "System" },
  { label: "Audit", group: "System" },
];

function AdminLogin({ onLogin }) {
  const [form, setForm] = React.useState({
    email: isMockMode ? "preview@atomglobal.com" : "",
    password: isMockMode ? "preview-only" : "",
  });
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

  return <main className="admin-login">
    <section className="admin-login__frame">
      <div className="admin-login__story">
        <BrandLogo />
        <span className="admin-login__badge">Secure, self-hosted platform</span>
        <h1>Manage the complete assessment journey.</h1>
        <p>Participants, assessments, reports, payments, email, affiliates and brand settings in one protected workspace.</p>
        <div className="admin-login__assurance">
          <i aria-hidden="true" />
          <span>PHP sessions · MariaDB · role permissions · audit history</span>
        </div>
      </div>

      <form className="admin-login__card" onSubmit={submit}>
        <div className="admin-login__mobile-logo"><BrandLogo /></div>
        <p className="eyebrow">{isMockMode ? "Preview workspace" : "Administrator access"}</p>
        <h2>Welcome back</h2>
        <p className="admin-login__intro">Sign in to manage Head–Heart Alignment.</p>

        <Notice type="error">{state.error}</Notice>

        <label>
          Email address
          <input
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            placeholder="name@company.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
            placeholder="Enter your password"
            required
          />
        </label>

        <button className="button button--primary admin-login__submit" disabled={state.busy}>
          {state.busy ? "Signing in…" : isMockMode ? "Open preview workspace" : "Sign in securely"}
        </button>

        <div className="admin-login__security">
          <span aria-hidden="true">●</span>
          {isMockMode
            ? "Preview data only. No live participant or payment records are used."
            : "Protected by secure sessions, CSRF validation, rate limits and role permissions."}
        </div>
      </form>
    </section>
  </main>;
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
    api.adminSession()
      .then(result => setUser(result.user))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <Spinner />;
  if (!user) return <AdminLogin onLogin={setUser} />;

  const logout = () => api.adminLogout().finally(() => setUser(null));
  const ActivePage = pages[active] || DashboardPage;
  let previousGroup = "";

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/" className="admin-brand">
        <BrandLogo />
        <span>Head–Heart Alignment</span>
      </a>

      <nav aria-label="Administration">
        {sections.map(section => {
          const showGroup = section.group !== previousGroup;
          previousGroup = section.group;
          return <React.Fragment key={section.label}>
            {showGroup && <small className="admin-nav-group">{section.group}</small>}
            <button
              type="button"
              className={section.label === active ? "active" : ""}
              onClick={() => setActive(section.label)}
            >
              <span>{section.label}</span>
            </button>
          </React.Fragment>;
        })}
      </nav>

      <div className="admin-user">
        <i>{user.displayName?.split(" ").map(part => part[0]).join("").slice(0, 2) || "AG"}</i>
        <span>{user.displayName}<small>{user.roleName}</small></span>
        <button type="button" onClick={logout}>Sign out</button>
      </div>
    </aside>

    <main className="admin-main" style={{ "--admin-logo": `url(${branding.logoUrl})` }}>
      <div className="admin-context-bar">
        <span>Head–Heart Alignment</span>
        <strong>{active}</strong>
        <em>{isMockMode ? "Preview" : "Secure workspace"}</em>
      </div>
      <ActivePage />
    </main>
  </div>;
}
