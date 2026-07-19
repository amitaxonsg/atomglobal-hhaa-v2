import React from "react";
import { api } from "../../api/client";
import { DataTable, Notice, PageHeader, Spinner, dateTime, money, useLoader } from "./AdminShared";
import { FunnelChart, TrackProgress, TrendChart } from "./AdminCharts";

export default function AdminDashboardPage() {
  const dashboard = useLoader(() => api.adminDashboard(), []);
  const insights = useLoader(() => api.adminInsights(), []);
  const notifications = useLoader(() => api.adminNotifications(), []);
  const refresh = () => { dashboard.refresh(); insights.refresh(); notifications.refresh(); };
  const acknowledge = id => api.acknowledgeNotification(id).then(notifications.refresh);

  if (dashboard.loading && insights.loading) return <Spinner />;

  return <>
    <PageHeader eyebrow={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())} title="Dashboard" actions={<button className="button" onClick={refresh}>Refresh</button>} />
    <Notice type="error">{dashboard.error || insights.error || notifications.error}</Notice>

    <section className="metric-grid">
      {(dashboard.data?.metrics || []).map(metric => <article className="metric" key={metric.label}><span>{metric.label}</span><strong>{metric.label === "Revenue" ? money(metric.value) : metric.value}</strong></article>)}
    </section>

    <div className="admin-dashboard-grid">
      <section className="admin-card admin-card--wide">
        <div className="card-heading"><div><h2>Assessment activity</h2><small>Last 14 days</small></div></div>
        <TrendChart data={insights.data?.daily || []} />
      </section>
      <section className="admin-card">
        <div className="card-heading"><div><h2>30-day funnel</h2><small>Started to paid report</small></div></div>
        <FunnelChart items={insights.data?.funnel || []} />
      </section>
    </div>

    <div className="admin-dashboard-grid">
      <section className="admin-card admin-card--wide">
        <div className="card-heading"><div><h2>Track progress</h2><small>Average completion and revenue over 30 days</small></div></div>
        <TrackProgress items={insights.data?.trackProgress || []} />
      </section>
      <aside className="admin-card">
        <div className="card-heading"><h2>Email operations</h2></div>
        <dl className="admin-definition">
          <div><dt>Pending or retrying</dt><dd>{insights.data?.emailSummary?.pending || 0}</dd></div>
          <div><dt>Sent</dt><dd>{insights.data?.emailSummary?.sent || 0}</dd></div>
          <div><dt>Failed</dt><dd>{insights.data?.emailSummary?.failed || 0}</dd></div>
        </dl>
        <h2>System attention</h2>
        <dl className="admin-definition">
          <div><dt>Failed emails</dt><dd>{dashboard.data?.failures?.failedEmails || 0}</dd></div>
          <div><dt>Failed webhooks</dt><dd>{dashboard.data?.failures?.failedWebhooks || 0}</dd></div>
          <div><dt>Critical alerts</dt><dd>{dashboard.data?.failures?.criticalAlerts || 0}</dd></div>
        </dl>
      </aside>
    </div>

    <div className="admin-grid">
      <section className="admin-card">
        <div className="card-heading"><h2>Recent participants</h2></div>
        <DataTable columns={["Participant", "Assessment", "Progress", "Payment", "Last activity"]} rows={(dashboard.data?.participants || []).map(row => [<><strong>{row.name}</strong><span>{row.email}</span></>, row.track, <div className="compact-progress"><i style={{ width: `${Number(row.progress || 0)}%` }} /><span>{row.progress || 0}%</span></div>, row.payment || row.paymentStatus || "Free", dateTime(row.activity || row.lastActivityAt)])} />
      </section>
      <aside className="admin-card">
        <div className="card-heading"><h2>Unacknowledged alerts</h2></div>
        <div className="admin-list">{(notifications.data?.items || []).filter(item => !item.acknowledged_at).slice(0, 8).map(item => <div key={item.id}><strong>{item.title}</strong><small>{item.message}</small><button onClick={() => acknowledge(item.id)}>Acknowledge</button></div>)}</div>
      </aside>
    </div>
  </>;
}
