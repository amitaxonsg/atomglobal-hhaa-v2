import React from "react";
import { api, isMockMode } from "../../api/client";
import { parseReportPayload, reportSummary } from "../../data/runtimeAssessment";
import { AlignmentGauge, RadarChart } from "../shared/Charts";
import { ArrowRight, Check, Lock } from "../shared/Icons";
import { StageShell } from "./AssessmentLayout";

function Roadmap({ content }) {
  const roadmap = Array.isArray(content?.roadmap) ? content.roadmap : [];
  if (!roadmap.length) return null;
  return <div className="full-report-copy">
    <h3>Development roadmap</h3>
    {roadmap.map((item, index) => <article key={item.area || index}>
      <h4>{item.area || `Development area ${index + 1}`}</h4>
      <p>{item.insight || item.summary || ""}</p>
      {Array.isArray(item.steps) && <ul>{item.steps.map(step => <li key={step}>{step}</li>)}</ul>}
    </article>)}
  </div>;
}

function ScoreBreakdown({ subscales }) {
  const entries = Object.entries(subscales || {});
  if (entries.length < 3) return null;
  return <div className="report-radar-wrap">
    <RadarChart values={entries.map(([, value]) => Number(value))} labels={entries.map(([label]) => label)} />
    <div className="report-score-list">
      {entries.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}/25</strong></div>)}
    </div>
  </div>;
}

export default function ReportView({ payload, token, onReset }) {
  const report = parseReportPayload(payload);
  const summary = reportSummary(report);
  const paidContent = report?.paid?.content || report?.paid || null;
  const unlocked = Boolean(report?.is_unlocked);
  const [checkout, setCheckout] = React.useState({ busy: false, error: "" });
  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: report?.currency || "USD",
  }).format(Number(report?.priceMinor || 0) / 100);

  const openCheckout = async () => {
    setCheckout({ busy: true, error: "" });
    try {
      const result = await api.createCheckout({ sessionId: report.sessionId, track: report.trackKey });
      if (result.preview) window.location.reload();
      else window.location.href = result.url;
    } catch (error) {
      setCheckout({ busy: false, error: error.message });
    }
  };

  const actions = <>
    {onReset ? <button className="button button--ghost" onClick={onReset}>Start again</button> : <a className="button button--ghost" href="/">New assessment</a>}
    {unlocked && report?.pdf_available && token && <a className="button button--ghost" href={`/api/reports/${encodeURIComponent(token)}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>}
    <button className="button button--primary" onClick={() => window.print()}>Print report</button>
  </>;

  return <StageShell stageKey="report" current={4} actions={actions}>
    <p className="eyebrow">{report?.trackName || "Head–Heart Alignment"} result</p>
    <h1>{summary.profile}</h1>
    <p className="lead">{report?.participantName ? `${report.participantName}, this` : "This"} result was calculated by the published assessment version from your saved responses.</p>

    <section className="report-hero">
      <AlignmentGauge score={summary.total} />
      <div><h2>Your alignment pattern</h2><p>{summary.summary}</p></div>
    </section>

    <div className="report-columns">
      <section className="report-card"><h2>Strengths to build on</h2><ul>{summary.strengths.map(item => <li key={item}><Check />{item}</li>)}</ul></section>
      <section className="report-card"><h2>Development observations</h2><ul>{summary.watchouts.map(item => <li key={item}><span>—</span>{item}</li>)}</ul></section>
    </div>

    <section className={`paid-report ${unlocked ? "unlocked" : "locked"}`}>
      <div className="paid-heading">
        <div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "Go beyond the headline"}</h2></div>
        {!unlocked && <span className="lock-badge"><Lock /> Locked</span>}
      </div>

      {unlocked ? <>
        <ScoreBreakdown subscales={report?.paid?.subscales || summary.subscales} />
        {paidContent?.summary && <section className="report-card"><h3>Full profile interpretation</h3><p>{paidContent.summary}</p></section>}
        <Roadmap content={paidContent} />
        {Array.isArray(paidContent?.upgradeReasons) && <section className="report-card"><h3>Use this report to</h3><ul>{paidContent.upgradeReasons.map(item => <li key={item}>{item}</li>)}</ul></section>}
        <p className="preview-note">Your private link is time-limited. Open the PDF or print a copy for your records.</p>
      </> : <>
        <div className="locked-preview">
          <div><h3>10-area radar and deep dive</h3><p>See how your pattern shifts across decisions, relationships, conflict and pressure.</p></div>
          <div><h3>Practical development roadmap</h3><p>Receive tailored actions, working-style guidance and track-specific development insights.</p></div>
        </div>
        {checkout.error && <p className="form-error" role="alert">{checkout.error}</p>}
        <div className="upgrade-box">
          <div><span>One-time payment</span><strong>{price}</strong><small>Secure checkout · Printable PDF · Private report link</small></div>
          <button className="button button--primary" disabled={checkout.busy} onClick={openCheckout}>{checkout.busy ? "Opening checkout…" : "Unlock complete report"} <ArrowRight /></button>
        </div>
      </>}
    </section>

    {isMockMode && <p className="preview-note">Preview mode simulates payment. Production unlocks only after a verified Stripe webhook or authorised administrator action.</p>}
  </StageShell>;
}
