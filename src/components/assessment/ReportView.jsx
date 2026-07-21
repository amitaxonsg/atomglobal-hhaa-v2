import React from "react";
import { api, isMockMode } from "../../api/client";
import { parseReportPayload, reportSummary } from "../../data/runtimeAssessment";
import { AlignmentGauge, RadarChart } from "../shared/Charts";
import { ArrowRight, Check, Lock } from "../shared/Icons";
import { StageShell } from "./AssessmentLayout";

const fullReportPreview = [
  "Complete profile summary and full strengths list",
  "Challenges and development areas with explanation",
  "Sharpest Edge and Growth Edge",
  "Relationship, team and working-style guidance",
  "All 10 subscales with actions and radar chart",
  "Development roadmap and three-month retake plan",
  "Written reflections, methodology and printable PDF",
];

function ListSection({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return <section className="report-card"><h3>{title}</h3><ul>{items.map((item, index) => <li key={`${title}-${index}`}>{typeof item === "string" ? item : item?.text || item?.summary || JSON.stringify(item)}</li>)}</ul></section>;
}

function CopySection({ title, value }) {
  if (!value) return null;
  return <section className="report-card"><h3>{title}</h3>{Array.isArray(value) ? <ul>{value.map((item, index) => <li key={`${title}-${index}`}>{typeof item === "string" ? item : item?.text || item?.summary || JSON.stringify(item)}</li>)}</ul> : <p>{typeof value === "string" ? value : value?.summary || value?.text || JSON.stringify(value)}</p>}</section>;
}

function Roadmap({ content }) {
  const roadmap = Array.isArray(content?.roadmap) ? content.roadmap : Array.isArray(content?.developmentRoadmap) ? content.developmentRoadmap : [];
  if (!roadmap.length) return null;
  return <section className="full-report-copy report-page-break">
    <h3>Development roadmap</h3>
    {roadmap.slice(0, 5).map((item, index) => <article key={item.area || index}>
      <h4>{item.area || `Development area ${index + 1}`}</h4>
      <p>{item.insight || item.summary || item.explanation || ""}</p>
      {Array.isArray(item.steps) && <ol>{item.steps.slice(0, 3).map(step => <li key={step}>{step}</li>)}</ol>}
    </article>)}
  </section>;
}

function ScoreBreakdown({ subscales, details = [] }) {
  const entries = Object.entries(subscales || {});
  if (entries.length < 3) return null;
  return <section className="report-page-break"><h3>Complete 10-area profile</h3><div className="report-radar-wrap">
    <RadarChart values={entries.map(([, value]) => Number(value))} labels={entries.map(([label]) => label)} />
    <div className="report-score-list">
      {entries.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}/25</strong></div>)}
    </div>
  </div>
  <p className="preview-note">Scores further toward the Heart or Head end show your strongest preference in that area. Read the deep-dive with the context of your whole pattern rather than treating one score in isolation.</p>
  {Array.isArray(details) && details.length > 0 && <div className="full-report-copy">{details.map((item, index) => <article key={item.code || item.name || index}><h4>{item.name || item.code || `Area ${index + 1}`}</h4><p>{item.meaning || item.summary || item.interpretation || ""}</p>{item.importance && <p><strong>Why it matters:</strong> {item.importance}</p>}{item.action && <p><strong>What to do:</strong> {item.action}</p>}</article>)}</div>}
  </section>;
}

function reportAsText(report, summary, paidContent) {
  const lines = [
    `${report?.trackName || "Head–Heart Alignment"} Report`,
    `Profile: ${summary.profile}`,
    `Score: ${summary.total}/250`,
    "",
    summary.summary,
    "",
    "Strengths:",
    ...summary.strengths.map(item => `- ${item}`),
  ];
  if (paidContent) {
    lines.push("", "Full report:", JSON.stringify(paidContent, null, 2));
  }
  return lines.join("\n");
}

export default function ReportView({ payload, token, onReset }) {
  const report = parseReportPayload(payload);
  const summary = reportSummary(report);
  const paidContent = report?.paid?.content || report?.paid || null;
  const unlocked = Boolean(report?.is_unlocked);
  const [checkout, setCheckout] = React.useState({ busy: false, error: "" });
  const [copyState, setCopyState] = React.useState("");
  const topStrengths = summary.strengths.slice(0, 2);
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

  const textReport = reportAsText(report, summary, unlocked ? paidContent : null);
  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(textReport);
      setCopyState("Copied");
    } catch {
      setCopyState("Copy unavailable");
    }
  };
  const emailSubject = encodeURIComponent(`${report?.trackName || "Head–Heart Alignment"} report`);
  const emailBody = encodeURIComponent(textReport);

  const actions = <>
    {onReset ? <button className="button button--ghost" onClick={onReset}>Start again</button> : <a className="button button--ghost" href="/">New assessment</a>}
    <a className="button button--ghost" href={`mailto:${encodeURIComponent(report?.participantEmail || "")}?subject=${emailSubject}&body=${emailBody}`}>Email to self</a>
    <button className="button button--ghost" onClick={copyReport}>{copyState || "Copy as text"}</button>
    {unlocked && report?.pdf_available && token && <a className="button button--ghost" href={`/api/reports/${encodeURIComponent(token)}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>}
    <button className="button button--primary" onClick={() => window.print()}>Print report</button>
  </>;

  return <StageShell stageKey="report" current={4} actions={actions}>
    <p className="eyebrow">{report?.trackName || "Head–Heart Alignment"} result</p>
    <h1>{summary.profile}</h1>
    <p className="lead">{report?.participantName ? `${report.participantName}, this` : "This"} result was calculated by the published assessment version from your saved responses.</p>

    <section className="report-hero" aria-label={`Head–Heart score ${summary.total} out of 250`}>
      <AlignmentGauge score={summary.total} />
      <div><h2>Your Head–Heart pattern</h2><p>{summary.summary}</p><strong className="report-total-score">{summary.total}/250</strong></div>
    </section>

    <section className="report-card"><h2>Your top two strengths</h2><ul>{topStrengths.map(item => <li key={item}><Check />{item}</li>)}</ul></section>

    {!unlocked && <section className="missing-panel"><p className="eyebrow">Here’s what you’re missing</p><h2>The Full Report explains why, what to do and how your pattern compares.</h2><ul>{fullReportPreview.map(item => <li key={item}><Check />{item}</li>)}</ul></section>}

    <section className={`paid-report ${unlocked ? "unlocked" : "locked"}`}>
      <div className="paid-heading">
        <div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "Go beyond the headline"}</h2></div>
        {!unlocked && <span className="lock-badge"><Lock /> Locked</span>}
      </div>

      {unlocked ? <>
        <CopySection title="Complete profile summary" value={paidContent?.profileSummary || paidContent?.summary} />
        <ListSection title="Full strengths list" items={paidContent?.strengths || summary.strengths} />
        <CopySection title="Challenges and development areas" value={paidContent?.challenges || paidContent?.developmentAreas || summary.watchouts} />
        <CopySection title="Your Sharpest Edge" value={paidContent?.sharpestEdge} />
        <CopySection title="Your Growth Edge" value={paidContent?.growthEdge} />
        <CopySection title={report?.trackKey === "personal" ? "In relationships" : "With your team"} value={paidContent?.relationships || paidContent?.team} />
        <CopySection title={`${report?.trackName || "Your"} style`} value={paidContent?.workingStyle || paidContent?.managementStyle || paidContent?.executiveStyle} />
        <CopySection title="How You Handle Difficulty" value={paidContent?.difficulty || paidContent?.handleDifficulty} />
        {report?.trackKey !== "personal" && <CopySection title={report?.trackKey === "newjoiner" ? "How You’re Coming Across" : "Leadership Impact"} value={paidContent?.leadershipImpact || paidContent?.howYouComeAcross} />}
        {report?.trackKey !== "personal" && <CopySection title="Culture Fit Reflection" value={paidContent?.cultureFit} />}
        <ListSection title="Five practical everyday actions" items={paidContent?.actions || paidContent?.everydayActions} />
        <ScoreBreakdown subscales={report?.paid?.subscales || summary.subscales} details={paidContent?.subscales || paidContent?.deepDive} />
        <Roadmap content={paidContent} />
        <CopySection title="Understand the Head–Heart Profiles" value={paidContent?.profileSpectrum || paidContent?.profiles} />
        <ListSection title="Your written reflections" items={paidContent?.reflections || report?.reflections} />
        <section className="report-card"><h3>Retake in three months</h3><p>Repeat the assessment in approximately three months to compare your pattern and track development over time.</p></section>
        <CopySection title="Methodology and sourcing" value={paidContent?.methodology || report?.methodology} />
        <p className="preview-note">Your private link is time-limited. Email, copy, print or open the PDF to keep a shareable copy.</p>
      </> : <>
        <div className="locked-preview">
          <div><h3>10-area radar and deep dive</h3><p>See how your pattern shifts across decisions, relationships, conflict and pressure.</p></div>
          <div><h3>Practical development roadmap</h3><p>Receive tailored actions, working-style guidance and track-specific development insights.</p></div>
        </div>
        {checkout.error && <p className="form-error" role="alert">{checkout.error}</p>}
        <div className="upgrade-box">
          <div><span>One-time payment</span><strong>{price}</strong><small>Price pending Amit and Stripe confirmation · Printable PDF · Private report link</small></div>
          <button className="button button--primary" disabled={checkout.busy || !report?.priceMinor} onClick={openCheckout}>{checkout.busy ? "Opening checkout…" : report?.priceMinor ? "Unlock complete report" : "Checkout not yet enabled"} <ArrowRight /></button>
        </div>
      </>}
    </section>

    {isMockMode && <p className="preview-note">Preview mode simulates payment. Production unlocks only after a verified Stripe webhook or authorised administrator action.</p>}
  </StageShell>;
}
