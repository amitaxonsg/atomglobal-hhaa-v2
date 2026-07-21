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
  "All 10 areas with actions and radar chart",
  "Development roadmap and three-month retake plan",
  "Written reflections, methodology and printable PDF",
];

function textValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(" · ");
  if (typeof value === "object") return textValue(value.text || value.summary || value.detail || value.insight || value.explanation || value.action || value.title || value.area);
  return "";
}

function ListSection({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  const values = items.map(item => {
    if (item && typeof item === "object" && item.question && item.text) return `${item.question}: ${item.text}`;
    return textValue(item);
  }).filter(Boolean);
  if (!values.length) return null;
  return <section className="report-card"><h3>{title}</h3><ul>{values.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></section>;
}

function CopySection({ title, value }) {
  if (!value) return null;
  if (Array.isArray(value)) return <ListSection title={title} items={value} />;
  const text = textValue(value);
  if (!text) return null;
  return <section className="report-card"><h3>{title}</h3><p>{text}</p></section>;
}

function UpgradeReasons({ items, locked = false }) {
  if (!Array.isArray(items) || !items.length) return null;
  const normalised = items.map((item, index) => {
    if (typeof item === "string") return { title: item, detail: "", key: `${index}-${item}` };
    if (!item || typeof item !== "object") return null;
    return {
      title: textValue(item.title || item.area) || `Full Report feature ${index + 1}`,
      detail: textValue(item.detail || item.summary || item.insight),
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

function Roadmap({ content }) {
  const roadmap = Array.isArray(content?.roadmap) ? content.roadmap : Array.isArray(content?.developmentRoadmap) ? content.developmentRoadmap : [];
  if (!roadmap.length) return null;
  return <section className="full-report-copy report-page-break">
    <h3>Development roadmap</h3>
    {roadmap.slice(0, 5).map((item, index) => <article key={item.area || index}>
      <h4>{item.area || `Development area ${index + 1}`}</h4>
      <p>{textValue(item.insight || item.summary || item.explanation)}</p>
      {Array.isArray(item.steps) && <ol>{item.steps.slice(0, 3).map(step => <li key={textValue(step)}>{textValue(step)}</li>)}</ol>}
    </article>)}
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

function ScoreBreakdown({ subscales, details = [] }) {
  const entries = Object.entries(subscales || {});
  if (entries.length < 3) return null;
  return <section className="report-page-break"><h3>Complete 10-area profile</h3><div className="report-radar-wrap">
    <RadarChart values={entries.map(([, value]) => Number(value))} labels={entries.map(([label]) => label)} />
    <div className="report-score-list">
      {entries.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}/25</strong></div>)}
    </div>
  </div>
  <p className="preview-note">Scores further toward the Heart or Head end show your strongest preference in that area. Read each deep dive in the context of your complete pattern.</p>
  {Array.isArray(details) && details.length > 0 && <div className="full-report-copy">{details.map((item, index) => <article key={item.code || item.name || index}><h4>{item.name || item.code || `Area ${index + 1}`}</h4><p>{textValue(item.meaning || item.summary || item.interpretation)}</p>{item.importance && <p><strong>Why it matters:</strong> {textValue(item.importance)}</p>}{item.action && <p><strong>What to do:</strong> {textValue(item.action)}</p>}</article>)}</div>}
  </section>;
}

function reportAsText(report, summary, paidContent) {
  const lines = [
    `${report?.trackName || "Head–Heart Alignment"} Report`,
    `Profile: ${summary.profile}`,
    `Score: ${summary.total}/250`,
    "",
    "Top two strengths:",
    ...summary.strengths.slice(0, 2).map(item => `- ${textValue(item)}`),
  ];
  if (paidContent) lines.push("", "Full report:", JSON.stringify(paidContent, null, 2));
  return lines.join("\n");
}

function FullReportContent({ report, summary, content }) {
  if (!content) return <p className="preview-note">Full Report content is unavailable. Contact Atom Global support.</p>;
  return <>
    <CopySection title="Complete profile summary" value={content.profileSummary || content.summary} />
    <ListSection title="Full strengths list" items={content.strengths || summary.strengths} />
    <CopySection title="Challenges and development areas" value={content.challenges || content.developmentAreas || content.watchouts || summary.watchouts} />
    <CopySection title="Your Sharpest Edge" value={content.sharpestEdge} />
    <CopySection title="Your Growth Edge" value={content.growthEdge} />
    <CopySection title={report?.trackKey === "personal" ? "In relationships" : "With your team"} value={content.relationships || content.team} />
    <CopySection title={`${report?.trackName || "Your"} style`} value={content.workingStyle || content.managementStyle || content.executiveStyle || content.work} />
    <ListSection title="Working-style actions" items={content.workingStyleTips} />
    <CopySection title="How You Handle Difficulty" value={content.difficulty || content.handleDifficulty || content.handlingDifficulty} />
    {report?.trackKey !== "personal" && <CopySection title={report?.trackKey === "newjoiner" ? "How You’re Coming Across" : "Leadership Impact"} value={content.leadershipImpact || content.howYouComeAcross} />}
    {report?.trackKey !== "personal" && <CopySection title="Culture Fit Reflection" value={content.cultureFit || content.cultureFitPrompt} />}
    <ListSection title="Five practical everyday actions" items={content.actions || content.everydayActions || content.growth} />
    <ScoreBreakdown subscales={report?.paid?.subscales || summary.subscales} details={content.subscales || content.deepDive} />
    <SubscaleReads content={content} />
    <Roadmap content={content} />
    <CopySection title="Understand the Head–Heart Profiles" value={content.profileSpectrum || content.profiles} />
    <ListSection title="Your written reflections" items={content.reflections || report?.reflections} />
    <section className="report-card"><h3>Retake in three months</h3><p>Repeat the assessment in approximately three months to compare your pattern and track development over time.</p></section>
    <CopySection title="Methodology and sourcing" value={content.methodology || report?.methodology} />
    <UpgradeReasons items={content.upgradeReasons} />
    <p className="preview-note">Your private link is time-limited. Email, copy, print or open the PDF to keep a shareable copy.</p>
  </>;
}

export default function ReportView({ payload, token, onReset }) {
  const report = parseReportPayload(payload);
  const summary = reportSummary(report);
  const paidContent = report?.paid?.content || report?.paid || null;
  const unlocked = Boolean(report?.is_unlocked);
  const checkoutAvailable = isMockMode || Boolean(report?.checkoutAvailable);
  const upgradePreview = report?.free?.upgradePreview?.length ? report.free.upgradePreview : fullReportPreview;
  const [checkout, setCheckout] = React.useState({ busy: false, error: "" });
  const [copyState, setCopyState] = React.useState("");
  const topStrengths = summary.strengths.slice(0, 2);
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
    {unlocked && <a className="button button--ghost" href={`mailto:${encodeURIComponent(report?.participantEmail || "")}?subject=${emailSubject}&body=${emailBody}`}>Email to self</a>}
    {unlocked && <button className="button button--ghost" onClick={copyReport}>{copyState || "Copy as text"}</button>}
    {unlocked && report?.pdf_available && token && <a className="button button--ghost" href={`/api/reports/${encodeURIComponent(token)}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>}
    {unlocked && <button className="button button--primary" onClick={() => window.print()}>Print report</button>}
  </>;

  return <StageShell stageKey="report" actions={actions}>
    <p className="eyebrow">{report?.trackName || "Head–Heart Alignment"} result</p>
    <h1>{summary.profile}</h1>

    <section className="report-hero" aria-label={`Head–Heart score ${summary.total} out of 250`}>
      <AlignmentGauge score={summary.total} />
      <div><h2>Your Head–Heart score</h2><strong className="report-total-score">{summary.total}/250</strong></div>
    </section>

    <section className="report-card"><h2>Your top two strengths</h2><ul>{topStrengths.map(item => <li key={textValue(item)}><Check />{textValue(item)}</li>)}</ul></section>

    {!unlocked && <section className="missing-panel"><p className="eyebrow">Here’s what you’re missing</p><h2>The Full Report explains why, what to do and how your pattern compares.</h2><UpgradeReasons items={upgradePreview} locked /></section>}

    <section className={`paid-report ${unlocked ? "unlocked" : "locked"}`}>
      <div className="paid-heading">
        <div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "This is the short version"}</h2></div>
        {!unlocked && <span className="lock-badge"><Lock /> Locked</span>}
      </div>

      {unlocked ? <FullReportContent report={report} summary={summary} content={paidContent} /> : <>
        {checkout.error && <p className="form-error" role="alert">{checkout.error}</p>}
        <div className="upgrade-box">
          <div><span>One-time payment</span><strong>{price}</strong><small>Proposed price pending Amit and Stripe confirmation · Printable PDF · Private report link</small></div>
          <button className="button button--primary" disabled={!checkoutAvailable || checkout.busy} onClick={openCheckout}>{checkout.busy ? "Opening checkout…" : checkoutAvailable ? "Unlock complete report" : "Full Report checkout coming soon"} {checkoutAvailable && <ArrowRight />}</button>
        </div>
        {!checkoutAvailable && <p className="preview-note">Your Lite Report is ready now. Full Report purchasing will open only after Atom Global completes its secure Stripe configuration.</p>}
      </>}
    </section>

    {isMockMode && <p className="preview-note">Preview mode simulates payment. Production unlocks only after a verified Stripe webhook or authorised administrator action.</p>}
  </StageShell>;
}
