import React from "react";
import { money } from "./AdminShared";

function pointsFor(data, key, width = 620, height = 180, padding = 24) {
  const values = data.map(item => Number(item[key] || 0));
  const maximum = Math.max(1, ...values);
  return values.map((value, index) => {
    const x = padding + (data.length <= 1 ? 0 : index / (data.length - 1) * (width - padding * 2));
    const y = height - padding - value / maximum * (height - padding * 2);
    return { x, y, value };
  });
}

function linePath(points) {
  return points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function TrendChart({ data = [] }) {
  const started = pointsFor(data, "started");
  const completed = pointsFor(data, "completed");
  const labels = data.filter((_, index) => index === 0 || index === data.length - 1 || index % 4 === 0);
  if (!data.length) return <div className="admin-empty">Trend data will appear after assessment activity begins.</div>;

  return <div className="admin-chart">
    <div className="admin-chart__legend"><span><i className="chart-key chart-key--started" />Started</span><span><i className="chart-key chart-key--completed" />Completed</span></div>
    <svg viewBox="0 0 620 210" role="img" aria-label="Assessments started and completed across the last fourteen days">
      {[40, 80, 120, 160].map(y => <line className="admin-chart__grid" key={y} x1="24" x2="596" y1={y} y2={y} />)}
      <path className="admin-chart__line admin-chart__line--started" d={linePath(started)} />
      <path className="admin-chart__line admin-chart__line--completed" d={linePath(completed)} />
      {started.map((point, index) => <circle className="admin-chart__point admin-chart__point--started" key={`s-${index}`} cx={point.x} cy={point.y} r="3" />)}
      {completed.map((point, index) => <circle className="admin-chart__point admin-chart__point--completed" key={`c-${index}`} cx={point.x} cy={point.y} r="3" />)}
      {labels.map(item => {
        const index = data.indexOf(item);
        const x = started[index]?.x || 24;
        return <text key={item.date} x={x} y="205" textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${item.date}T00:00:00`))}</text>;
      })}
    </svg>
  </div>;
}

export function FunnelChart({ items = [] }) {
  const maximum = Math.max(1, ...items.map(item => Number(item.value || 0)));
  return <div className="admin-funnel">
    {items.map(item => <div className="admin-funnel__row" key={item.label}>
      <span>{item.label}</span>
      <div><i style={{ width: `${Number(item.value || 0) / maximum * 100}%` }} /></div>
      <strong>{item.value}</strong>
    </div>)}
  </div>;
}

export function TrackProgress({ items = [] }) {
  if (!items.length) return <div className="admin-empty">Track progress will appear after participant activity begins.</div>;
  return <div className="track-progress-list">
    {items.map(item => <article key={item.trackKey}>
      <header><strong>{item.track}</strong><span>{item.averageProgress}% average</span></header>
      <div className="track-progress"><i style={{ width: `${Math.min(100, Number(item.averageProgress || 0))}%` }} /></div>
      <footer><span>{item.completed} completed of {item.started} started</span><span>{money(item.revenueMinor)}</span></footer>
    </article>)}
  </div>;
}
