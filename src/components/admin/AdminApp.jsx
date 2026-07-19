import React from "react";
import { api, isMockMode } from "../../api/client";
import { stageContent } from "../../api/mockData";

const sections = ["Dashboard", "Participants", "Assessments", "Content", "Email", "Affiliates", "Settings"];

function AdminLogin({ onLogin }) {
  return <main className="admin-login"><div className="admin-login__card">
    <img src="/media/brand/atom-global-wordmark.png" alt="Atom Global Consulting" />
    <p className="eyebrow">Head–Heart Alignment</p><h1>Administration</h1>
    <label>Email<input type="email" defaultValue={isMockMode ? "preview@atomglobal.com" : ""} /></label>
    <label>Password<input type="password" defaultValue={isMockMode ? "preview-only" : ""} /></label>
    <button className="button button--primary" onClick={onLogin}>{isMockMode ? "Enter preview CMS" : "Sign in"}</button>
    {isMockMode && <p className="hint">Preview mode uses representative data only. Production authentication is handled by secure PHP sessions.</p>}
  </div></main>;
}

function Dashboard({ data }) {
  return <><header className="admin-page-header"><div><p className="eyebrow">Sunday, 19 July 2026</p><h1>Good morning</h1></div><button className="button">Export report</button></header>
    <section className="metric-grid">{data.metrics.map(([label, value, change]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{change}</small></article>)}</section>
    <div className="admin-grid"><section className="admin-card"><div className="card-heading"><h2>Recent participants</h2><button>View all</button></div><div className="table-wrap"><table><thead><tr><th>Participant</th><th>Assessment</th><th>Progress</th><th>Payment</th><th>Last activity</th></tr></thead><tbody>{data.participants.map(row => <tr key={row.email}><td><strong>{row.name}</strong><span>{row.email}</span></td><td>{row.track}</td><td><div className="mini-progress"><i style={{width:`${row.progress}%`}} /></div>{row.progress}%</td><td><span className={`status status--${row.payment.toLowerCase()}`}>{row.payment}</span></td><td>{row.activity}</td></tr>)}</tbody></table></div></section>
    <aside className="admin-card"><div className="card-heading"><h2>Recent activity</h2></div><ol className="activity-list">{data.activity.map((item, index) => <li key={item}><i>{index + 1}</i><span>{item}<small>{index + 1} hour{index ? "s" : ""} ago</small></span></li>)}</ol></aside></div>
  </>;
}

function ContentManager() {
  const [content, setContent] = React.useState(stageContent);
  const [selected, setSelected] = React.useState("version");
  const item = content[selected];
  const update = (key, value) => setContent(current => ({ ...current, [selected]: { ...current[selected], [key]: value } }));
  return <><header className="admin-page-header"><div><p className="eyebrow">Experience</p><h1>Stage content</h1></div><button className="button button--primary">Save changes</button></header><div className="content-editor"><aside className="stage-list">{Object.entries(content).map(([key, stage]) => <button className={key === selected ? "active" : ""} key={key} onClick={() => setSelected(key)}><img src={stage.image} alt=""/><span>{key.replaceAll("-", " ")}<small>{stage.active ? "Active" : "Inactive"}</small></span></button>)}</aside><section className="admin-card editor-form"><div className="editor-preview" style={{backgroundImage:`linear-gradient(rgba(24,20,15,.${item.overlay}),rgba(24,20,15,.${item.overlay})),url(${item.image})`, backgroundPosition:item.focalPoint}}><h2>{item.headline}</h2><p>{item.supporting}</p></div><div className="form-grid"><label>Headline<textarea value={item.headline} onChange={event => update("headline", event.target.value)} /></label><label>Supporting text<textarea value={item.supporting} onChange={event => update("supporting", event.target.value)} /></label><label>Image alt text<input value={item.alt} onChange={event => update("alt", event.target.value)} /></label><label>Focal point<select value={item.focalPoint} onChange={event => update("focalPoint", event.target.value)}><option>50% 50%</option><option>40% 50%</option><option>60% 50%</option></select></label><label>Overlay strength<input type="range" min="20" max="85" value={item.overlay} onChange={event => update("overlay", event.target.value)} /></label><label className="check-row"><input type="checkbox" checked={item.active} onChange={event => update("active", event.target.checked)} /> Active stage</label></div></section></div></>;
}

function PlaceholderPage({ section }) {
  const descriptions = {
    Participants: "Search participants, review answers and reports, manage consent, resend emails, export records, and process anonymisation requests.",
    Assessments: "Clone, preview, publish and archive immutable assessment versions while preserving every historical session snapshot.",
    Email: "Edit transactional and reminder templates, inspect the delivery queue, retry failures, and send a provider test message.",
    Affiliates: "Manage referral codes, attribution windows, conversion revenue, commission status, fraud flags, and CSV exports.",
    Settings: "Configure branding, legal content, Stripe, email, analytics consent, report tokens, retention and security controls.",
  };
  return <><header className="admin-page-header"><div><p className="eyebrow">Administration</p><h1>{section}</h1></div><button className="button button--primary">Create new</button></header><section className="admin-card empty-panel"><span>{section.slice(0,1)}</span><h2>{section} workspace</h2><p>{descriptions[section]}</p><div className="skeleton-lines"><i/><i/><i/></div></section></>;
}

export default function AdminApp() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [active, setActive] = React.useState("Dashboard");
  const [data, setData] = React.useState(null);
  React.useEffect(() => { if (authenticated) api.adminDashboard().then(setData); }, [authenticated]);
  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  return <div className="admin-shell"><aside className="admin-sidebar"><a href="/" className="admin-brand"><img src="/media/brand/atom-global-wordmark.png" alt="Atom Global Consulting"/><span>Assessment CMS</span></a><nav>{sections.map(section => <button className={section === active ? "active" : ""} onClick={() => setActive(section)} key={section}>{section}</button>)}</nav><div className="admin-user"><i>AO</i><span>Alex Morgan<small>Owner · Preview</small></span></div></aside><main className="admin-main">{active === "Dashboard" && data && <Dashboard data={data} />}{active === "Content" && <ContentManager />}{!['Dashboard','Content'].includes(active) && <PlaceholderPage section={active} />}</main></div>;
}

