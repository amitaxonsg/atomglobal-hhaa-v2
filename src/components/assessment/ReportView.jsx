import React from "react";
import { api, isMockMode } from "../../api/client";
import { parseReportPayload, reportSummary, v3AreaName } from "../../data/runtimeAssessment";
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

function ListSection({ title, items, ordered = false }) {
  if (!Array.isArray(items) || !items.length) return null;
  const values = items.map(item => textValue(item)).filter(Boolean);
  if (!values.length) return null;
  const List = ordered ? "ol" : "ul";
  return <section className="report-card"><h3>{title}</h3><List>{values.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</List></section>;
}

function Roadmap({ content }) {
  const roadmap = Array.isArray(content?.roadmap) ? content.roadmap : [];
  if (!roadmap.length) return null;
  return <section className="report-card full-report-copy">
    <h3>Development roadmap</h3>
    <p>Choose two or three changes from this roadmap to practise consistently. The goal is not to change everything at once, but to build a small number of observable habits you can revisit.</p>
    {roadmap.map((item, index) => <article key={item.area || index}>
      <h4>{item.area || `Development area ${index + 1}`}</h4>
      <p>{item.insight || item.summary || ""}</p>
      {Array.isArray(item.steps) && <ul>{item.steps.map(step => <li key={step}>{step}</li>)}</ul>}
    </article>)}
  </section>;
}

function UpgradeReasons({ items, locked = false }) {
  if (!Array.isArray(items) || !items.length) return null;
  const normalised = items.map((item, index) => {
    if (typeof item === "string") return { title: item, detail: "", key: `${index}-${item}` };
    if (!item || typeof item !== "object") return null;
    return { title: item.title || item.area || `Full Report feature ${index + 1}`, detail: item.detail || item.summary || item.insight || "", key: item.title || item.area || index };
  }).filter(Boolean);
  if (!normalised.length) return null;
  return <section className={locked ? "locked-preview locked-preview--cms" : "report-card"}>
    {!locked && <h3>Use this report to</h3>}
    {normalised.map(item => <div key={item.key} className={locked ? "locked-preview__item" : "full-report-feature"}><h4>{item.title}</h4>{item.detail && <p>{item.detail}</p>}</div>)}
  </section>;
}

function SubscaleReads({ content, trackKey }) {
  const reads = content?.subscaleReads;
  if (!reads || typeof reads !== "object" || Array.isArray(reads)) return null;
  const entries = Object.entries(reads).filter(([, value]) => textValue(value));
  if (!entries.length) return null;
  return <section className="report-card"><h3>Your 10-area interpretation</h3><div className="full-report-copy">{entries.map(([key, value]) => <article key={key}><h4>{v3AreaName(trackKey, key, key)}</h4><p>{textValue(value)}</p></article>)}</div></section>;
}

function ScoreBreakdown({ subscales, trackKey }) {
  const entries = Object.entries(subscales || {});
  if (entries.length < 3) return null;
  const labels = entries.map(([label]) => v3AreaName(trackKey, label, label));
  return <div className="report-radar-wrap"><RadarChart values={entries.map(([, value]) => Number(value))} labels={labels} /><div className="report-score-list">{entries.map(([label, value]) => <div key={label}><span>{v3AreaName(trackKey, label, label)}</span><strong>{value}/25</strong></div>)}</div></div>;
}

function RetakeComparison({ comparison, trackKey }) {
  if (!comparison || !Array.isArray(comparison.areas)) return null;
  const signed = value => `${Number(value) > 0 ? "+" : ""}${Number(value)}`;
  return <section className="report-card full-report-copy">
    <h3>Your progress since the previous assessment</h3>
    <p><strong>Overall:</strong> {comparison.previousTotal} → {comparison.currentTotal} ({signed(comparison.totalChange)})</p>
    <div className="report-score-list">{comparison.areas.map(area => <div key={area.code}><span>{v3AreaName(trackKey, area.code, area.code)}</span><strong>{area.previous} → {area.current} ({signed(area.change)})</strong></div>)}</div>
    {comparison.guidance && <p>{comparison.guidance}</p>}
  </section>;
}

function RetakePlan({ report }) {
  const [state, setState] = React.useState({ busy: false, error: "" });
  const recommended = report?.retakeRecommendedAt ? new Date(report.retakeRecommendedAt) : null;
  const recommendedLabel = recommended && !Number.isNaN(recommended.getTime()) ? recommended.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "about three months from now";
  const available = isMockMode || Boolean(report?.retakeCheckoutAvailable);
  const startRetake = async () => {
    if (!available || state.busy) return;
    setState({ busy: true, error: "" });
    try {
      const result = await api.createCheckout({ sessionId: report.sessionId, track: report.trackKey, affiliateCode: "__RETAKE__" });
      if (result.url) window.location.href = result.url;
      else if (result.preview) setState({ busy: false, error: "Preview mode does not create a live retake payment." });
      else throw new Error("Retake checkout is unavailable.");
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };
  return <section className="report-card">
    <h3>3-month retake and progress check</h3>
    <p>Commit to two or three changes from this report and work on them consistently. Retake the full 40-question assessment around <strong>{recommendedLabel}</strong> so you can compare what shifted, what stayed stable, and where old patterns still show up under pressure.</p>
    <p><strong>Retake price: USD 2.</strong> This option is for participants who previously completed and unlocked the paid Full Development Report. After verified payment, a fresh 40-question retake is created and the new Full Development Report compares the new result with the previous result in the same report.</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="button button--primary" disabled={!available || state.busy} onClick={startRetake}>{state.busy ? "Opening USD 2 checkout…" : available ? "Retake full assessment — USD 2" : "Retake checkout coming soon"}</button>
  </section>;
}

function FullReportContent({ report, summary, content }) {
  if (!content) return <p className="preview-note">Full Report content is unavailable. Contact Atom Global support.</p>;
  return <>
    <RetakeComparison comparison={content.retakeComparison} trackKey={report?.trackKey} />
    <ScoreBreakdown subscales={report?.paid?.subscales || summary.subscales} trackKey={report?.trackKey} />
    <TextSection title="Complete profile summary" value={content.summary} />
    <ListSection title="Full strengths list" items={content.strengths} />
    <ListSection title="Challenges and development areas" items={content.watchouts} />
    <TextSection title="Development areas" value={content.developmentAreas} />
    <ListSection title="Development areas" items={content.developmentAreas} />
    <TextSection title="Relationships / team" value={content.relationships} />
    <TextSection title="Personal / working style" value={content.work} />
    <ListSection title="Working-style actions" items={content.workingStyleTips} />
    <TextSection title="How you handle difficulty" value={content.handlingDifficulty} />
    <TextSection title={content.leadershipImpactLabel || "Leadership impact"} value={content.leadershipImpact} />
    <TextSection title={content.cultureFitLabel || "Culture fit reflection"} value={content.cultureFitPrompt} />
    <ListSection title="Five practical everyday actions" items={(content.growth || []).slice(0, 5)} ordered />
    <SubscaleReads content={content} trackKey={report?.trackKey} />
    <Roadmap content={content} />
    <RetakePlan report={report} />
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
  const cashOnDeliveryAvailable = Boolean(report?.cashOnDeliveryAvailable);
  const upgradePreview = report?.free?.upgradePreview || [];
  const [checkout, setCheckout] = React.useState({ busy: false, error: "" });
  const price = new Intl.NumberFormat(undefined, { style: "currency", currency: report?.currency || "USD" }).format(Number(report?.priceMinor || 0) / 100);

  const openCheckout = async () => {
    if (!checkoutAvailable) return;
    setCheckout({ busy: true, error: "" });
    try {
      const result = await api.createCheckout({ sessionId: report.sessionId, track: report.trackKey });
      if (result.preview) window.location.reload(); else window.location.href = result.url;
    } catch (error) { setCheckout({ busy: false, error: error.message }); }
  };

  const openCashOnDelivery = async () => {
    if (!cashOnDeliveryAvailable || checkout.busy) return;
    setCheckout({ busy: true, error: "" });
    try {
      const response = await fetch("/api/payments/cash-on-delivery", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: report.sessionId, track: report.trackKey }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Cash on Delivery checkout failed");
      window.location.href = result.successUrl || result.reportUrl;
    } catch (error) { setCheckout({ busy: false, error: error.message }); }
  };

  const actions = <>{onReset ? <button className="button button--ghost" onClick={onReset}>Start again</button> : <a className="button button--ghost" href="/">New assessment</a>}{unlocked && report?.pdf_available && token && <a className="button button--ghost" href={`/api/reports/${encodeURIComponent(token)}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>}<button className="button button--primary" onClick={() => window.print()}>Print report</button></>;

  return <StageShell stageKey="report" current={4} actions={actions}>
    <p className="eyebrow">{report?.trackName || "Head–Heart Alignment"} result</p><h1>{summary.profile}</h1>
    <p className="lead">{report?.participantName ? `${report.participantName}, this` : "This"} result was calculated by the published assessment version from your saved responses.</p>
    <section className="report-hero"><AlignmentGauge score={summary.total} /><div><h2>Your alignment pattern</h2><p>{summary.summary}</p></div></section>
    <div className="report-columns"><section className="report-card"><h2>Top three strengths</h2><ul>{summary.strengths.slice(0, 3).map(item => <li key={item}><Check />{item}</li>)}</ul></section><section className="report-card"><h2>Development observations</h2><ul>{summary.watchouts.map(item => <li key={item}><span>—</span>{item}</li>)}</ul></section></div>
    <section className={`paid-report ${unlocked ? "unlocked" : "locked"}`}>
      <div className="paid-heading"><div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "This is the short version"}</h2></div>{!unlocked && <span className="lock-badge"><Lock /> Locked</span>}</div>
      {unlocked ? <FullReportContent report={report} summary={summary} content={paidContent} /> : <>
        <p>Your Full Report goes deeper into the patterns behind this result and turns them into practical development guidance.</p><UpgradeReasons items={upgradePreview} locked />
        {!upgradePreview.length && <div className="locked-preview"><div><h3>10-area radar and deep dive</h3><p>See how your pattern shifts across decisions, relationships, conflict and pressure.</p></div><div><h3>Practical development roadmap</h3><p>Receive tailored actions, working-style guidance and track-specific development insights.</p></div></div>}
        {checkout.error && <p className="form-error" role="alert">{checkout.error}</p>}
        <div className="upgrade-box"><div><span>One-time payment</span><strong>{price}</strong><small>Secure checkout · Printable PDF · Private report link</small></div><div className="upgrade-box__actions"><button className="button button--primary" disabled={!checkoutAvailable || checkout.busy} onClick={openCheckout}>{checkout.busy ? "Opening checkout…" : checkoutAvailable ? "Pay by card" : "Full Report checkout coming soon"} {checkoutAvailable && <ArrowRight />}</button>{cashOnDeliveryAvailable && <button className="button button--ghost" disabled={checkout.busy} onClick={openCashOnDelivery}>Cash on Delivery</button>}</div></div>
        {cashOnDeliveryAvailable && <p className="preview-note">Cash on Delivery is temporarily enabled for client UAT. Selecting it unlocks the Full Report and queues the normal confirmation/report emails without charging Stripe.</p>}
        {!checkoutAvailable && !cashOnDeliveryAvailable && <p className="preview-note">Your Lite Report is ready now. Full Report purchasing will open after Atom Global completes its secure payment configuration.</p>}
      </>}
    </section>
    {isMockMode && <p className="preview-note">Preview mode simulates payment. Production unlocks only after a verified Stripe webhook or authorised administrator action.</p>}
  </StageShell>;
}
