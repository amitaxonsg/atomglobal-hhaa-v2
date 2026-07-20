import React from "react";
import { api, isMockMode } from "../../api/client";
import { parseReportPayload, reportSummary } from "../../data/runtimeAssessment";
import { AlignmentGauge, RadarChart } from "../shared/Charts";
import { ArrowRight, Check, Lock } from "../shared/Icons";
import { StageShell } from "./AssessmentLayout";

function textValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function TextSection({ title, value }) {
  const text = textValue(value);
  if (!text) return null;
  return <section className="report-card"><h3>{title}</h3><p>{text}</p></section>;
}

function ListSection({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  const values = items.map(item => textValue(item)).filter(Boolean);
  if (!values.length) return null;
  return <section className="report-card"><h3>{title}</h3><ul>{values.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></section>;
}

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

function UpgradeReasons({ items, locked = false }) {
  if (!Array.isArray(items) || !items.length) return null;
  const normalised = items.map((item, index) => {
    if (typeof item === "string") return { title: item, detail: "", key: `${index}-${item}` };
    if (!item || typeof item !== "object") return null;
    return {
      title: item.title || item.area || `Full Report feature ${index + 1}`,
      detail: item.detail || item.summary || item.insight || "",
      key: item.title || item.area || index,
    };
  }).filter(Boolean);
  if (!normalised.length) return null;
  return <section className={locked ? "locked-preview locked-preview--cms" : "report-card"}>
    {!locked && <h3>Use this report to</h3>}
    {normalised.map(item => <div key={item.key} className={locked ? "locked-preview__item" : "full-report-feature"}>
      <h4>{item.title}</h4>
      {item.detail && <p>{item.detail}</p>}
    </div>)}
  </section>;
}

function SubscaleReads({ content }) {
  const reads = content?.subscaleReads;
  if (!reads || typeof reads !== "object" || Array.isArray(reads)) return null;
  const entries = Object.entries(reads).filter(([, value]) => textValue(value));
  if (!entries.length) return null;
  return <section className="report-card"><h3>Your 10-area interpretation</h3>
    <div className="full-report-copy">{entries.map(([key, value]) => <article key={key}><h4>{key}</h4><p>{textValue(value)}</p></article>)}</div>
  </section>;
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

function FullReportContent({ report, summary, content }) {
  if (!content) return <p className="preview-note">Full Report content is unavailable. Contact Atom Global support.</p>;
  return <>
    <ScoreBreakdown subscales={report?.paid?.subscales || summary.subscales} />
    <TextSection title="Full profile interpretation" value={content.summary} />
    <ListSection title="Strengths to build on" items={content.strengths} />
    <ListSection title="Challenges and watch-outs" items={content.watchouts} />
    <TextSection title="Development areas" value={content.developmentAreas} />
    <ListSection title="Development areas" items={content.developmentAreas} />
    <TextSection title="In relationships" value={content.relationships} />
    <TextSection title="Improving your working style" value={content.work} />
    <ListSection title="Working-style actions" items={content.workingStyleTips} />
    <TextSection title="How you handle difficulty" value={content.handlingDifficulty} />
    <TextSection title={content.leadershipImpactLabel || "Leadership impact"} value={content.leadershipImpact} />
    <TextSection title={content.cultureFitLabel || "Culture fit reflection"} value={content.cultureFitPrompt} />
    <ListSection title="Practical ideas for growth" items={content.growth} />
    <SubscaleReads content={content} />
    <Roadmap content={content} />
    <UpgradeReasons items={content.upgradeReasons} />
    <p className="preview-note">Your private link is time-limited. Open the PDF or print a copy for your records.</p>
  </>;
}

export default function ReportView({ payload, token, onReset }) {
  const report = parseReportPayload(payload);
  const summary = reportSummary(report);
  const paidContent = report?.paid?.content || report?.paid || null;
  const unlocked = Boolean(report?.is_unlocked);
  const checkoutAvailable = isMockMode || Boolean(report?.checkoutAvailable);
  const upgradePreview = report?.free?.upgradePreview || [];
  const [checkout, setCheckout] = React.useState({ busy: false, error: "" });
  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: report?.currency || "USD",
  }).format(Number(report?.priceMinor || 0) / 100);

  const openCheckout = async () => {
    if (!checkoutAvailable) return;
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
        <div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "This is the short version"}</h2></div>
        {!unlocked && <span className="lock-badge"><Lock /> Locked</span>}
      </div>

      {unlocked ? <FullReportContent report={report} summary={summary} content={paidContent} /> : <>
        <p>Your Full Report goes deeper into the patterns behind this result and turns them into practical development guidance.</p>
        <UpgradeReasons items={upgradePreview} locked />
        {!upgradePreview.length && <div className="locked-preview">
          <div><h3>10-area radar and deep dive</h3><p>See how your pattern shifts across decisions, relationships, conflict and pressure.</p></div>
          <div><h3>Practical development roadmap</h3><p>Receive tailored actions, working-style guidance and track-specific development insights.</p></div>
        </div>}
        {checkout.error && <p className="form-error" role="alert">{checkout.error}</p>}
        <div className="upgrade-box">
          <div><span>One-time payment</span><strong>{price}</strong><small>Secure checkout · Printable PDF · Private report link</small></div>
          <button className="button button--primary" disabled={!checkoutAvailable || checkout.busy} onClick={openCheckout}>{checkout.busy ? "Opening checkout…" : checkoutAvailable ? "Unlock complete report" : "Full Report checkout coming soon"} {checkoutAvailable && <ArrowRight />}</button>
        </div>
        {!checkoutAvailable && <p className="preview-note">Your Lite Report is ready now. Full Report purchasing will open after Atom Global completes its secure Stripe configuration.</p>}
      </>}
    </section>

    {isMockMode && <p className="preview-note">Preview mode simulates payment. Production unlocks only after a verified Stripe webhook or authorised administrator action.</p>}
  </StageShell>;
}
